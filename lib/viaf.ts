import type { ResolvedEntity, SourceIdentifier } from "./types";
import { lookupCurator } from "./curators";

/**
 * VIAF client.
 *
 * VIAF is free and requires no API key. We hit two endpoints:
 *   GET https://viaf.org/viaf/sourceID/{CURATOR}|{ID}   — translate source ID → cluster
 *   GET https://viaf.org/viaf/{viafId}                  — fetch the cluster itself
 *
 * The first redirects to the second; we just follow the redirect and parse the cluster
 * JSON. Content negotiation via the `httpAccept` query parameter is more reliable than
 * the Accept header in practice — VIAF's CDN has been known to ignore Accept.
 */

const VIAF_BASE = "https://viaf.org";

/**
 * Look up an entity by (curator, id). Returns a normalized ResolvedEntity or throws.
 *
 * Throws on:
 *  - unknown HTTP status from VIAF
 *  - 404 (mapped to a typed error by the caller)
 *  - malformed cluster JSON
 */
export async function viafLookup(
  query: SourceIdentifier
): Promise<ResolvedEntity> {
  const curator = query.curator.toUpperCase();
  const id = query.id.trim();

  const url = `${VIAF_BASE}/viaf/sourceID/${encodeURIComponent(curator)}|${encodeURIComponent(id)}?httpAccept=application/json`;

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "application/json" },
    // VIAF has reasonable uptime but is occasionally slow; cap at 10s.
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    if (response.status === 404) {
      const err: any = new Error(`VIAF: no cluster for ${curator}|${id}`);
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }
    const err: any = new Error(`VIAF returned ${response.status}`);
    err.code = "UPSTREAM_ERROR";
    err.status = response.status;
    throw err;
  }

  const json = await response.json();
  return normalizeVIAFCluster(json, query, response.url, response.status);
}

/**
 * Normalize a raw VIAF cluster JSON object into our internal shape.
 *
 * The VIAF cluster schema is large and variable across record types. We pluck:
 *   - viafID                → cluster id used in the canonical URI
 *   - mainHeadings.data[]   → preferred label (we take the LC heading if present)
 *   - nameType              → "Personal", "Corporate", "Geographic", etc.
 *   - sources.source[]      → the (curator, id) pairs that constitute the cluster
 *
 * This is deliberately conservative — if a field isn't present we leave it undefined
 * rather than guessing. The Stage 1 page renders gracefully around missing data.
 */
function normalizeVIAFCluster(
  cluster: any,
  query: SourceIdentifier,
  finalUrl: string,
  responseStatus: number
): ResolvedEntity {
  const viafId: string | undefined =
    cluster?.viafID ??
    cluster?.["viafID"] ??
    extractViafIdFromUrl(finalUrl);

  if (!viafId) {
    throw new Error("VIAF response missing viafID");
  }

  // Preferred label — prefer the LC heading when available, otherwise the first one.
  const mainHeadings = asArray(cluster?.mainHeadings?.data);
  let label: string | undefined;
  if (mainHeadings.length) {
    const lcHeading = mainHeadings.find((h: any) =>
      asArray(h?.sources?.s).some((s: any) =>
        typeof s === "string" ? s === "LC" : s?.["#text"] === "LC"
      )
    );
    const chosen = lcHeading ?? mainHeadings[0];
    label = typeof chosen?.text === "string" ? chosen.text : undefined;
  }

  const nameType: string | undefined =
    typeof cluster?.nameType === "string" ? cluster.nameType : undefined;

  // Source identifiers — VIAF lists them under sources.source[] with values like "LC|n79018049".
  const sameAs: SourceIdentifier[] = [];
  for (const raw of asArray(cluster?.sources?.source)) {
    const value: string | undefined =
      typeof raw === "string" ? raw : raw?.["#text"] ?? raw?.text;
    if (!value || !value.includes("|")) continue;
    const [curator, ...rest] = value.split("|");
    const sourceId = rest.join("|"); // ids can contain slashes etc.
    if (!curator || !sourceId) continue;
    // Skip the input curator/id — that's our query, not a sameAs entry.
    if (
      curator.toUpperCase() === query.curator.toUpperCase() &&
      sourceId === query.id
    ) {
      continue;
    }
    sameAs.push({
      curator,
      id: sourceId,
      curatorLabel: lookupCurator(curator)?.label,
    });
  }

  return {
    source: "viaf",
    canonicalUri: `http://viaf.org/viaf/${viafId}`,
    query: {
      ...query,
      curatorLabel: lookupCurator(query.curator)?.label,
    },
    // VIAF does not publish a content hash. The MD5 fingerprint annotation
    // on Stage 1 explains why this is absent in VIAF mode.
    entityMd5: undefined,
    label,
    nameType,
    sameAs,
    wire: {
      requestMethod: "GET",
      requestUrl: `${VIAF_BASE}/viaf/sourceID/${query.curator.toUpperCase()}|${query.id}`,
      responseStatus,
      fetchedAt: new Date().toISOString(),
    },
  };
}

function asArray<T>(v: T | T[] | null | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function extractViafIdFromUrl(url: string): string | undefined {
  const m = /\/viaf\/(\d+)/.exec(url);
  return m?.[1];
}
