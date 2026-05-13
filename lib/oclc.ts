import type { ResolvedEntity, SourceIdentifier } from "./types";
import { lookupCurator } from "./curators";

/**
 * OCLC WorldCat Entities client.
 *
 * Two responsibilities:
 *
 *   1. Mint and cache an OAuth2 Client Credentials Grant (CCG) access token.
 *      The WSKey for institution 8995 has the `publicEntities:read_brief_entities`
 *      and `publicEntities:read_references` scopes, neither of which require
 *      end-user consent — server-to-server tokens are sufficient.
 *
 *   2. Provide a thin `oclcEnrichByViaf` helper that the resolver uses to attach
 *      a WorldCat Entity URI and its content fingerprint (entityMd5) to a
 *      resolved record. This is best-effort: if OCLC is unreachable, mis-
 *      configured, or has no matching entity, the resolver still returns the
 *      VIAF result unchanged.
 *
 * Authorization Code + PKCE flow lives in app/api/auth/callback/route.ts. It
 * shares the same client id/secret but exchanges a user-supplied code instead
 * of using these client credentials directly.
 */

const TOKEN_URL = process.env.OCLC_TOKEN_URL ?? "https://oauth.oclc.org/token";
const ENTITIES_BASE =
  process.env.OCLC_ENTITIES_BASE_URL ?? "https://entity.api.oclc.org";
const SCOPES =
  process.env.OCLC_SCOPES ??
  "publicEntities:read_brief_entities publicEntities:read_references";

/** Module-level token cache. Process-local; on Vercel each cold start re-mints. */
let cachedToken: { value: string; expiresAt: number } | null = null;

export function oclcConfigured(): boolean {
  return Boolean(process.env.OCLC_CLIENT_ID && process.env.OCLC_CLIENT_SECRET);
}

/**
 * Mint (or return a cached) CCG access token. Throws if credentials are
 * missing or the token endpoint refuses the request — callers should treat
 * any throw as "OCLC not available, fall back".
 */
export async function getOclcAccessToken(): Promise<string> {
  if (!oclcConfigured()) {
    throw new Error("OCLC credentials not configured");
  }
  // Re-use the cached token until 30 seconds before its declared expiry.
  if (cachedToken && cachedToken.expiresAt - 30_000 > Date.now()) {
    return cachedToken.value;
  }

  const id = process.env.OCLC_CLIENT_ID!;
  const secret = process.env.OCLC_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: SCOPES,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `OCLC token endpoint returned ${response.status}: ${text.slice(0, 200)}`
    );
  }
  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
  };
  if (!json.access_token) {
    throw new Error("OCLC token response missing access_token");
  }
  const ttlMs = (json.expires_in ?? 1200) * 1000;
  cachedToken = { value: json.access_token, expiresAt: Date.now() + ttlMs };
  return cachedToken.value;
}

/**
 * Search the WorldCat Entities brief index for an entity carrying the given
 * VIAF id. Returns the first hit's normalized fields, or `null` when nothing
 * matches.
 *
 * The brief search endpoint accepts query parameters of the form
 * `?inLanguage=en&q=<lucene>` where `<lucene>` can match on external
 * identifiers via fields like `viafID`. We keep the call narrow (1 result)
 * to stay polite — this runs as an enrichment layer, not a primary lookup.
 */
export async function oclcLookupByViafId(viafId: string): Promise<{
  entityUri: string;
  entityMd5?: string;
  prefLabel?: string;
} | null> {
  const token = await getOclcAccessToken();
  // The Entities API splits its index by entity type. For our resolver use
  // case (people authority records) we target /data/person first; if that
  // misses, callers can extend this with /data/organization etc.
  const url = `${ENTITIES_BASE}/data/person?q=${encodeURIComponent(
    `viafID:${viafId}`
  )}&limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`OCLC entities search returned ${response.status}`);
  }
  const json: any = await response.json();
  // The brief response is { totalResults, entities: [...] } in current docs.
  const hit = Array.isArray(json?.entities) ? json.entities[0] : null;
  if (!hit) return null;
  const entityUri: string | undefined =
    typeof hit?.id === "string" ? hit.id : typeof hit?.uri === "string" ? hit.uri : undefined;
  if (!entityUri) return null;
  const entityMd5: string | undefined =
    typeof hit?.entityMd5 === "string"
      ? hit.entityMd5
      : typeof hit?.entityMD5 === "string"
        ? hit.entityMD5
        : undefined;
  const prefLabel: string | undefined =
    typeof hit?.prefLabel === "string"
      ? hit.prefLabel
      : typeof hit?.prefLabel?.["@value"] === "string"
        ? hit.prefLabel["@value"]
        : undefined;
  return { entityUri, entityMd5, prefLabel };
}

/**
 * Best-effort enrichment of a VIAF-resolved record with WorldCat Entity data.
 *
 * On success: returns a new ResolvedEntity carrying the WorldCat URI in
 * `sameAs` and the content fingerprint in `entityMd5`. On any failure:
 * returns the input record unchanged. This must never block or fail the
 * resolver path — the contract is "VIAF is authoritative; OCLC is gravy".
 */
export async function oclcEnrich(record: ResolvedEntity): Promise<ResolvedEntity> {
  if (!oclcConfigured()) return record;
  // Only attempt enrichment when we have a VIAF id to search by.
  const viafIdMatch = record.canonicalUri.match(/viaf\.org\/viaf\/(\d+)/i);
  if (!viafIdMatch) return record;
  try {
    const hit = await oclcLookupByViafId(viafIdMatch[1]);
    if (!hit) return record;
    const oclcSameAs: SourceIdentifier = {
      curator: "WORLDCAT",
      curatorLabel: lookupCurator("WORLDCAT")?.label ?? "OCLC WorldCat Entities",
      id: hit.entityUri,
      uri: hit.entityUri,
    };
    // Avoid duplicating an existing WORLDCAT entry.
    const sameAs = record.sameAs.some(
      (s) => s.curator.toUpperCase() === "WORLDCAT" && s.id === hit.entityUri
    )
      ? record.sameAs
      : [...record.sameAs, oclcSameAs];
    return {
      ...record,
      entityMd5: hit.entityMd5 ?? record.entityMd5,
      sameAs,
    };
  } catch {
    return record;
  }
}
