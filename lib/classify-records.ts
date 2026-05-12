import itByKing from "@/data/fixtures/classify/it-by-king.json";

/**
 * Classification records.
 *
 * Stage 3 anchors on a single real book classified both ways — Dewey
 * (hierarchical) and FAST (faceted) — so the visitor can see what each
 * scheme makes visible and what it hides. The data is captured from real
 * LC and OCLC records.
 *
 * Adding a second book is a matter of dropping another JSON into
 * data/fixtures/classify/ and adding it to the array below.
 */

export interface DeweyLevel {
  /** Friendly level name: "Class", "Division", "Section", etc. */
  level: string;
  /** The numeric prefix at this level — e.g. "800", "810", "813.5". */
  number: string;
  /** Human-readable Dewey label for the number. */
  label: string;
  /** Editorial note on why this level exists / matters. */
  description: string;
}

export interface DeweySibling {
  number: string;
  label: string;
}

export interface FastHeading {
  facet: "Topical" | "Geographic" | "Chronological" | "Form / Genre" | "Personal" | "Corporate";
  fastId: string;
  label: string;
  note: string;
}

export interface ClassifyRecord {
  id: string;
  work: {
    title: string;
    author: string;
    publishedYear: string;
    publisher: string;
    oclc: string;
    isbn: string;
  };
  dewey: {
    number: string;
    label: string;
    path: DeweyLevel[];
    /** Adjacent numbers at the same level, for context. */
    siblings: DeweySibling[];
  };
  fast: {
    headings: FastHeading[];
    philosophy: string;
  };
}

const RECORDS: ClassifyRecord[] = [itByKing as ClassifyRecord];

export function listClassifyRecords(): ClassifyRecord[] {
  return RECORDS;
}

export function getClassifyRecord(id: string): ClassifyRecord | null {
  return RECORDS.find((r) => r.id === id) ?? null;
}
