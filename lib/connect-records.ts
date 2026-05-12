import stephenKing from "@/data/fixtures/connect/stephen-king.json";

/**
 * Connection records — Stage 4.
 *
 * Each fixture is one entity's labeled neighborhood: who/what it touches,
 * grouped by the kind of relationship (notable-work, influenced-by,
 * contemporaries, subject-of, shared-subjects). Each group carries its own
 * editorial note explaining *what the relationship asserts* and *why the
 * graph is sparse or dense there*. That is the lesson, not the rendering
 * of a graph.
 *
 * Source data is captured from Wikidata + curated context. Live SPARQL
 * fallback is on the roadmap; the curated path lets us pick the
 * pedagogical edges instead of accepting whatever Wikidata happens to
 * have indexed.
 */

export type RelationshipType =
  | "notable-work"
  | "influenced-by"
  | "contemporaries"
  | "subject-of"
  | "shared-subjects";

export interface Neighbor {
  label: string;
  wikidata?: string;
  fastId?: string;
  year?: string;
  type?: string;
  note?: string;
}

export interface Relationship {
  type: RelationshipType;
  /** Human title, e.g. "Notable works". */
  title: string;
  /** Wikidata property + plain-language predicate, e.g. "P800 · notable work". */
  predicate: string;
  /** Editorial note explaining what this edge asserts and why graphs are sparse here. */
  explanation: string;
  neighbors: Neighbor[];
}

export interface ConnectRecord {
  id: string;
  entity: {
    name: string;
    wikidata: string;
    viaf: string;
    lc: string;
    birthYear: string;
    deathYear: string | null;
    summary: string;
  };
  relationships: Relationship[];
  /** Closing editorial note on graph sparsity. */
  sparsityNote: string;
}

const RECORDS: ConnectRecord[] = [stephenKing as ConnectRecord];

export function listConnectRecords(): ConnectRecord[] {
  return RECORDS;
}

export function getConnectRecord(id: string): ConnectRecord | null {
  return RECORDS.find((r) => r.id === id) ?? null;
}
