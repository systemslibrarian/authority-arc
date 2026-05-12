/**
 * Global-search query classifier.
 *
 * Takes whatever the visitor types into the strip-nav search bar and returns
 * the most useful destination path. The classifier inspects the shape of the
 * query and routes:
 *
 *   - Wikidata Q-id           → Stage 4 (Connect)
 *   - LCNAF identifier        → Stage 1 (Identify) with curator=LC
 *   - FAST identifier         → Stage 1 with curator=FAST
 *   - BNF identifier          → Stage 1 with curator=BNF
 *   - BNE identifier          → Stage 1 with curator=BNE
 *   - DNB identifier (numeric, 7–10) → Stage 1 with curator=DNB (best effort
 *     since "DNB" identifiers are pure numeric and overlap with VIAF clusters)
 *   - Pure numeric (longer)   → Stage 1 with curator=VIAF
 *   - Anything else (a name)  → Stage 2 (Distinguish) AutoSuggest with q=…
 *
 * The classifier is a pure function so it is trivial to test and to reuse
 * from anywhere a search-style input lives.
 */

export interface ClassifiedQuery {
  /** Path with query string, ready to pass to router.push(). */
  path: string;
  /** Coarse label for what we think we found — surfaced in the UI as a hint. */
  kind: "wikidata" | "lc" | "fast" | "bnf" | "bne" | "viaf" | "name" | "empty";
  /** The normalized query as we will pass it downstream. */
  normalized: string;
}

export function classifySearchQuery(raw: string): ClassifiedQuery {
  const q = raw.trim();
  if (!q) return { path: "", kind: "empty", normalized: "" };

  // Wikidata Q-identifiers (Q39829, q39829)
  if (/^Q\d+$/i.test(q)) {
    const id = q.toUpperCase();
    return { path: `/connect?q=${id}`, kind: "wikidata", normalized: id };
  }

  // LCNAF — n79018049, no2010012345, nr95018049 etc.
  if (/^n[ro]?\d{6,12}$/i.test(q)) {
    const id = q.toLowerCase();
    return {
      path: `/identify?curator=LC&id=${encodeURIComponent(id)}`,
      kind: "lc",
      normalized: id,
    };
  }

  // FAST — fst00041201
  if (/^fst\d+$/i.test(q)) {
    const id = q.toLowerCase();
    return {
      path: `/identify?curator=FAST&id=${encodeURIComponent(id)}`,
      kind: "fast",
      normalized: id,
    };
  }

  // BNF — cb11909418n
  if (/^cb\d+[a-z]?$/i.test(q)) {
    const id = q.toLowerCase();
    return {
      path: `/identify?curator=BNF&id=${encodeURIComponent(id)}`,
      kind: "bnf",
      normalized: id,
    };
  }

  // BNE — XX1058570
  if (/^XX\d+$/i.test(q)) {
    const id = q.toUpperCase();
    return {
      path: `/identify?curator=BNE&id=${encodeURIComponent(id)}`,
      kind: "bne",
      normalized: id,
    };
  }

  // Pure numeric — default to VIAF cluster. Anything else with a curator
  // prefix should already have matched a more-specific rule above. Long
  // numerics (>= 6 digits) are VIAF-shaped; shorter numerics are
  // ambiguous, so we still send them to Stage 1 as VIAF and let the
  // resolver decide.
  if (/^\d{6,12}$/.test(q)) {
    return {
      path: `/identify?curator=VIAF&id=${encodeURIComponent(q)}`,
      kind: "viaf",
      normalized: q,
    };
  }

  // Free text → name search via Stage 2.
  return {
    path: `/disambiguate?q=${encodeURIComponent(q)}`,
    kind: "name",
    normalized: q,
  };
}

/** Friendly human-readable label for a classification kind. */
export function describeClassification(kind: ClassifiedQuery["kind"]): string {
  switch (kind) {
    case "wikidata":
      return "Wikidata entity → Connect";
    case "lc":
      return "LCNAF identifier → Identify";
    case "fast":
      return "FAST identifier → Identify";
    case "bnf":
      return "BNF identifier → Identify";
    case "bne":
      return "BNE identifier → Identify";
    case "viaf":
      return "VIAF cluster → Identify";
    case "name":
      return "Name → Distinguish";
    case "empty":
      return "";
  }
}
