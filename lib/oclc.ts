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
 *   2. Provide a thin `oclcEnrich` helper that the resolver uses to attach a
 *      WorldCat Entity URI and its ETag fingerprint to a resolved record. This
 *      is best-effort: if OCLC is unreachable, mis-configured, or has no
 *      matching entity, the resolver still returns the VIAF result unchanged.
 *
 * Authorization Code + PKCE flow lives in app/api/auth/callback/route.ts. It
 * shares the same client id/secret but exchanges a user-supplied code instead
 * of using these client credentials directly.
 *
 * VIAF -> WorldCat bridge
 * -----------------------
 * Our WSKey scopes only unlock `GET https://id.oclc.org/worldcat/entity/{id}`,
 * which takes an OCLC entity ID in the path. OCLC's own PID Lookup API (which
 * would resolve VIAF -> entity ID) requires the `pidLookup` scope, gated by a
 * paid Meridian subscription. We therefore bridge through public data:
 *
 *   VIAF cluster -> Wikidata Q-id (Wikidata property P214 == VIAF id)
 *                -> WorldCat Entities ID (Wikidata property P10832)
 *                -> GET /entity/{id}    (our scopes unlock this)
 *
 * Every hop uses a free public API: VIAF, Wikidata SPARQL, and the OCLC
 * Entities Data endpoint with our existing scopes. No new scope required.
 */

const TOKEN_URL = process.env.OCLC_TOKEN_URL ?? "https://oauth.oclc.org/token";
const ENTITY_BASE =
  process.env.OCLC_ENTITY_BASE_URL ?? "https://id.oclc.org/worldcat";
const SCOPES =
  process.env.OCLC_SCOPES ??
  "publicEntities:read_brief_entities publicEntities:read_references";

const SPARQL_URL = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "AuthorityArc/1.0 (https://authority-arc.vercel.app; systemslibrarian@gmail.com)";

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
 * Bridge: given a VIAF id, ask Wikidata for the matching entity's WorldCat
 * Entities ID. Returns null if no Wikidata item carries that VIAF (P214) or
 * if the item has no P10832 statement.
 *
 * Uses the public Wikidata SPARQL endpoint; no auth, just a User-Agent.
 */
export async function worldcatEntityIdFromViafViaWikidata(
  viafId: string
): Promise<{ wikidataId: string; worldcatEntityId: string } | null> {
  const sparql = `
    SELECT ?item ?ocl WHERE {
      ?item wdt:P214 "${viafId.replace(/"/g, "")}" .
      ?item wdt:P10832 ?ocl .
    }
    LIMIT 1
  `;
  const url = `${SPARQL_URL}?query=${encodeURIComponent(sparql)}&format=json`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Wikidata SPARQL returned ${response.status}`);
  }
  const json: any = await response.json();
  const row = json?.results?.bindings?.[0];
  const itemUri: string | undefined = row?.item?.value;
  const ocl: string | undefined = row?.ocl?.value;
  if (!itemUri || !ocl) return null;
  const qidMatch = itemUri.match(/(Q\d+)$/);
  if (!qidMatch) return null;
  return { wikidataId: qidMatch[1], worldcatEntityId: ocl };
}

/**
 * Fetch the brief WorldCat Entity record by its OCLC entity ID. Returns null
 * on 404. Throws on other non-2xx responses so the caller can decide whether
 * to swallow or log.
 *
 * Requires `publicEntities:read_brief_entities` (and optionally
 * `publicEntities:read_references` for the `sameAs`/`relatedEntity` blocks).
 */
export async function oclcFetchEntity(
  entityId: string
): Promise<{
  entityUri: string;
  entityMd5?: string;
  prefLabel?: string;
  raw: unknown;
} | null> {
  const token = await getOclcAccessToken();
  const url = `${ENTITY_BASE}/entity/${encodeURIComponent(entityId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/ld+json",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`OCLC entity fetch returned ${response.status}`);
  }
  const json: any = await response.json();
  // ETag is the closest thing to OCLC's `entityMd5` content fingerprint
  // for this endpoint — it's stable per content version.
  const etag = response.headers.get("etag")?.replace(/^W\//, "").replace(/"/g, "");
  const entityUri =
    typeof json?.["@id"] === "string"
      ? json["@id"]
      : `${ENTITY_BASE}/entity/${entityId}`;
  // prefLabel can come back as either a plain string or a language map.
  let prefLabel: string | undefined;
  const pl = json?.prefLabel;
  if (typeof pl === "string") prefLabel = pl;
  else if (pl && typeof pl === "object") {
    prefLabel =
      (typeof pl.en === "string" && pl.en) ||
      Object.values(pl).find((v): v is string => typeof v === "string");
  }
  return {
    entityUri,
    entityMd5: etag || undefined,
    prefLabel,
    raw: json,
  };
}

/**
 * Resolve a VIAF id all the way to a populated OCLC entity record by bridging
 * through Wikidata. Returns null at any step where the bridge breaks
 * (no Wikidata item with that VIAF, no P10832 statement, or OCLC 404).
 */
export async function oclcLookupByViafId(viafId: string): Promise<{
  entityUri: string;
  entityMd5?: string;
  prefLabel?: string;
  wikidataId?: string;
} | null> {
  const bridge = await worldcatEntityIdFromViafViaWikidata(viafId);
  if (!bridge) return null;
  const hit = await oclcFetchEntity(bridge.worldcatEntityId);
  if (!hit) return null;
  return {
    entityUri: hit.entityUri,
    entityMd5: hit.entityMd5,
    prefLabel: hit.prefLabel,
    wikidataId: bridge.wikidataId,
  };
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
