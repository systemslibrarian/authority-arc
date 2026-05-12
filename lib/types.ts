/**
 * Authority Arc — shared types
 *
 * The frontend renders against `ResolvedEntity`. Both the VIAF path and the
 * (forthcoming) OCLC PID Lookup path normalize their responses into this shape
 * inside lib/viaf.ts and lib/pid-lookup.ts respectively. This keeps the UI free
 * of upstream-specific quirks and gives us a single place to evolve the schema.
 */

export type ResolveSource = "viaf" | "oclc-pid-lookup" | "fixture";

/** A persistent identifier as it lives in one source authority. */
export interface SourceIdentifier {
  /** Short curator code, e.g. "LC", "DNB", "BNF", "WIKIDATA", "FAST". */
  curator: string;
  /** Human-readable curator label, e.g. "Library of Congress/NACO". */
  curatorLabel?: string;
  /** The identifier value as issued by that curator. */
  id: string;
  /** Optional resolvable URI for the source record. */
  uri?: string;
}

/** The shape every stage-1 render uses. */
export interface ResolvedEntity {
  /** Where the data came from on this request. */
  source: ResolveSource;

  /** Canonical URI for the cluster/entity, if one exists. */
  canonicalUri: string;

  /** The (curator, id) pair the request was made with. */
  query: SourceIdentifier;

  /**
   * OCLC's MD5 fingerprint of the WorldCat Entity's content.
   * Present only when the OCLC PID Lookup path is used.
   * Absent on VIAF responses — VIAF does not publish a content hash.
   */
  entityMd5?: string;

  /** The "preferred" display label for the cluster (e.g. main heading). */
  label?: string;

  /** Type of authority record: "personal", "corporate", "geographic", "work", etc. */
  nameType?: string;

  /** All other (curator, id) pairs that resolve to the same entity. */
  sameAs: SourceIdentifier[];

  /**
   * Echo of the raw upstream request and response, for the "see the wire" panel.
   * The frontend collapses this by default; it's there so technical readers can
   * verify nothing is being faked.
   */
  wire: {
    requestMethod: "GET" | "POST";
    requestUrl: string;
    requestBody?: unknown;
    responseStatus: number;
    fetchedAt: string; // ISO-8601 UTC
  };
}

/** Error shape for /api/resolve failures. */
export interface ResolveError {
  error: true;
  status: number;
  code: "NOT_FOUND" | "BAD_INPUT" | "UPSTREAM_ERROR" | "RATE_LIMITED" | "UNKNOWN";
  message: string;
}

/** Curator metadata returned by /api/curator/[code]. */
export interface CuratorInfo {
  code: string;
  label: string;
  country?: string;
  marcOrganizationCode?: string;
  uriPattern?: string;
  description?: string;
}
