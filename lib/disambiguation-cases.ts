import twainClemens from "@/data/fixtures/disambiguation/twain-clemens.json";
import twoJohnSmiths from "@/data/fixtures/disambiguation/two-john-smiths.json";

/**
 * Disambiguation cases.
 *
 * Two curated cases anchor Stage 2's vote-then-reveal:
 *   - merge: Twain / Clemens — same person, name-form pseudonym.
 *   - split: two different "John Smith"s — physically separate people.
 *
 * Both are real authority records; the evidence lists are summarized from
 * the actual LC and VIAF entries. The cases are versioned in /data/fixtures
 * rather than fetched live because (a) the records do not change on any
 * useful timescale, and (b) we want the pedagogical content to be stable
 * across sessions so a returning visitor can re-share a state.
 */

export interface DisambiguationRecord {
  curator: string;
  curatorLabel: string;
  recordId: string;
  heading: string;
  birthYear: string;
  deathYear: string;
  nationality: string;
  field: string;
  knownFor: string[];
  alternativeNames: string[];
}

export interface DisambiguationCase {
  id: string;
  /** "merge" — answer is "same person". "split" — answer is "two different people". */
  kind: "merge" | "split";
  /** Question shown above the two records. */
  prompt: string;
  leftRecord: DisambiguationRecord;
  rightRecord: DisambiguationRecord;
  viafDecision: {
    answer: "merge" | "split";
    /** Present for merge cases — the unified VIAF cluster id. */
    viafCluster?: string;
    /** Present for split cases — the two distinct cluster ids. */
    leftViafCluster?: string;
    rightViafCluster?: string;
    /** Optional preferred display heading for merge cases. */
    preferredHeading?: string;
    /** Evidence catalogers cite to support the merge/split decision. */
    evidence: string[];
  };
  /** Editorial paragraph framing the case's significance. */
  explanation: string;
}

const CASES: DisambiguationCase[] = [
  twainClemens as DisambiguationCase,
  twoJohnSmiths as DisambiguationCase,
];

export function listDisambiguationCases(): DisambiguationCase[] {
  return CASES;
}

export function getDisambiguationCase(id: string): DisambiguationCase | null {
  return CASES.find((c) => c.id === id) ?? null;
}
