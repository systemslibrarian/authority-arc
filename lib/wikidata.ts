import type { ConnectRecord, Neighbor, Relationship } from "@/lib/connect-records";

/**
 * Wikidata Query Service (SPARQL) client.
 *
 * Stage 4's live source. Wikidata exposes a public SPARQL endpoint at
 * https://query.wikidata.org/sparql with no auth and reasonable
 * rate-limiting (we are a citizen of the open commons and identify
 * ourselves with a User-Agent header so they can ban us if we misbehave).
 *
 * We fetch three things in one round trip via a combined SPARQL query:
 *   - Base entity facts: english label, description, VIAF, LC,
 *     date-of-birth, date-of-death
 *   - Notable works (P800)            — neighbors the entity is responsible for
 *   - Influenced by (P737)            — neighbors the entity acknowledges
 *   - Subject of (?work P921 entity)  — works *about* the entity
 *
 * Contemporaries and "shared subjects" are not directly queryable as
 * a single predicate — Stage 4 keeps those curated for King and omits
 * them for arbitrary entities. The sparsity-as-signal lesson the page
 * teaches is therefore visible when a visitor explores a less-canonized
 * person: the live neighborhood will be smaller, not because the API
 * failed, but because the editing community has invested less attention.
 */

const SPARQL_URL = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "AuthorityArc/1.0 (https://authority-arc.vercel.app; systemslibrarian@gmail.com)";

interface SparqlBinding {
  value: string;
  type?: string;
}

interface SparqlRow {
  [key: string]: SparqlBinding;
}

interface SparqlResponse {
  results: { bindings: SparqlRow[] };
}

/**
 * Fetch a complete ConnectRecord-shaped neighborhood from Wikidata for
 * the given Q-identifier. Throws on non-2xx or timeout.
 *
 * @param wikidataId — bare ID with the "Q" prefix, e.g. "Q39829"
 */
export async function wikidataNeighborhood(
  wikidataId: string,
  options?: { signal?: AbortSignal }
): Promise<ConnectRecord> {
  const id = wikidataId.trim().toUpperCase();
  if (!/^Q\d+$/.test(id)) {
    const err: any = new Error(`Not a valid Wikidata Q-id: ${wikidataId}`);
    err.code = "BAD_INPUT";
    err.status = 400;
    throw err;
  }

  // One combined query keeps round trips at one. The OPTIONALs let us
  // tolerate missing fields gracefully — many entities have no DOB, no
  // VIAF mapping, etc.
  const sparql = `
    SELECT ?entityLabel ?entityDescription ?viaf ?lc ?birth ?death
           ?notableWork ?notableWorkLabel
           ?influencedBy ?influencedByLabel
           ?subjectOf ?subjectOfLabel
    WHERE {
      OPTIONAL { wd:${id} rdfs:label ?entityLabel . FILTER(LANG(?entityLabel) = "en") }
      OPTIONAL { wd:${id} schema:description ?entityDescription . FILTER(LANG(?entityDescription) = "en") }
      OPTIONAL { wd:${id} wdt:P214 ?viaf }
      OPTIONAL { wd:${id} wdt:P244 ?lc }
      OPTIONAL { wd:${id} wdt:P569 ?birth }
      OPTIONAL { wd:${id} wdt:P570 ?death }
      OPTIONAL { wd:${id} wdt:P800 ?notableWork . ?notableWork rdfs:label ?notableWorkLabel . FILTER(LANG(?notableWorkLabel) = "en") }
      OPTIONAL { wd:${id} wdt:P737 ?influencedBy . ?influencedBy rdfs:label ?influencedByLabel . FILTER(LANG(?influencedByLabel) = "en") }
      OPTIONAL { ?subjectOf wdt:P921 wd:${id} . ?subjectOf rdfs:label ?subjectOfLabel . FILTER(LANG(?subjectOfLabel) = "en") }
    }
    LIMIT 200
  `;

  const url = `${SPARQL_URL}?query=${encodeURIComponent(sparql)}&format=json`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
    signal: options?.signal ?? AbortSignal.timeout(12_000),
    // Next.js fetch cache: a Wikidata neighborhood doesn't change often.
    // Cache for an hour to keep the experience snappy without staling badly.
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const err: any = new Error(`Wikidata SPARQL returned ${response.status}`);
    err.code = response.status === 404 ? "NOT_FOUND" : "UPSTREAM_ERROR";
    err.status = response.status;
    throw err;
  }

  const json = (await response.json()) as SparqlResponse;
  return normalize(id, json);
}

function normalize(id: string, response: SparqlResponse): ConnectRecord {
  const rows = response?.results?.bindings ?? [];

  // First row carries the singletons (label, description, VIAF, LC, dates).
  const first = rows[0] ?? {};
  const label = first.entityLabel?.value ?? id;
  const description = first.entityDescription?.value ?? "";
  const viaf = first.viaf?.value;
  const lc = first.lc?.value;
  const birthYear = pickYear(first.birth?.value);
  const deathYear = pickYear(first.death?.value);

  // Deduplicate neighbors per predicate. SPARQL returns a cross-product
  // row for every combination of optional bindings; we collapse on the
  // neighbor Q-id (extracted from the URI suffix).
  const notableWorks = collectNeighbors(rows, "notableWork", "notableWorkLabel");
  const influencedBy = collectNeighbors(rows, "influencedBy", "influencedByLabel");
  const subjectOf = collectNeighbors(rows, "subjectOf", "subjectOfLabel");

  const relationships: Relationship[] = [];
  if (notableWorks.length) {
    relationships.push({
      type: "notable-work",
      title: "Notable works",
      predicate: "Wikidata P800 · notable work",
      explanation:
        "Wikidata's P800 records a one-way 'notable work' edge from a person to a work — what the editing community considers central to the person's identity. It does not promise completeness, and the choice of 'notable' is itself a curated decision.",
      neighbors: notableWorks,
    });
  }
  if (influencedBy.length) {
    relationships.push({
      type: "influenced-by",
      title: "Influenced by",
      predicate: "Wikidata P737 · influenced by",
      explanation:
        "P737 asserts a direct intellectual debt from one person to another. Edges typically reflect documented public statements; many influences exist in biographies that never make it into Wikidata because they were never confirmed by the person themselves.",
      neighbors: influencedBy,
    });
  }
  if (subjectOf.length) {
    relationships.push({
      type: "subject-of",
      title: "Subject of",
      predicate: "Wikidata reverse-link · works whose main subject is this person",
      explanation:
        "The reverse of P800: works whose 'main subject' (P921) is the person. Density of this edge is a rough proxy for how thoroughly someone has been studied — sparse for living non-academic figures, dense for canonical ones.",
      neighbors: subjectOf,
    });
  }

  return {
    id: id.toLowerCase(),
    entity: {
      name: label,
      wikidata: id,
      viaf: viaf ?? "",
      lc: lc ?? "",
      birthYear: birthYear ?? "",
      deathYear: deathYear ?? null,
      summary: description,
    },
    relationships,
    sparsityNote:
      relationships.length === 0
        ? "This entity exists in Wikidata but has no notable-work, influenced-by, or subject-of edges yet. Sparsity is not an artifact of the technology — it is a signal that the editing community has not (yet) invested attention here. The catalog still names this identity; it just has not yet been connected outward."
        : "Knowledge graphs do not fail uniformly. They are dense where the editing community has invested and sparse where attention is missing. The neighborhood above is what Wikidata's editors have recorded so far — a different entity, less canonized, would render a visibly sparser version of this same view.",
  };
}

function collectNeighbors(
  rows: SparqlRow[],
  uriKey: string,
  labelKey: string
): Neighbor[] {
  const seen = new Map<string, Neighbor>();
  for (const row of rows) {
    const uri = row[uriKey]?.value;
    const label = row[labelKey]?.value;
    if (!uri || !label) continue;
    const qid = extractQid(uri);
    if (!qid || seen.has(qid)) continue;
    seen.set(qid, { label, wikidata: qid });
  }
  return Array.from(seen.values()).slice(0, 12);
}

function extractQid(uri: string): string | null {
  const m = uri.match(/\/(Q\d+)$/);
  return m ? m[1] : null;
}

function pickYear(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/^([+-]?\d{4})/);
  if (!m) return undefined;
  // Wikidata dates often start with "+"; strip it.
  return m[1].replace(/^\+/, "");
}
