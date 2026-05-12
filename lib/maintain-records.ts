import kingLedger from "@/data/fixtures/maintain/king-ledger.json";

/**
 * Maintenance ledger records — Stage 5.
 *
 * Each ledger is one entity's curated history of catalog changes: when the
 * authority record was created, when a pseudonym was linked, when a
 * cross-source merge happened, when a name form was normalized for new
 * scripts. The entries are real *types* of changes that real records
 * undergo; specific dates are tied to public events where available and
 * are illustrative ranges otherwise. Stage 5's honest-capability is
 * explicit about which is which.
 */

export type LedgerEntryType =
  | "created"
  | "linked"
  | "added-source"
  | "merged"
  | "split"
  | "deprecated"
  | "normalized"
  | "corrected";

export interface LedgerEntry {
  year: string;
  type: LedgerEntryType;
  /** Which institution performed the change. */
  actor: string;
  title: string;
  detail: string;
  /** Editorial note on why this event matters in the larger arc. */
  significance: string;
}

export interface MaintainRecord {
  id: string;
  entity: {
    name: string;
    viaf: string;
    lc: string;
    established: string;
  };
  entries: LedgerEntry[];
  /** Closing note tying the ledger to the larger lesson on stewardship. */
  stewardshipNote: string;
}

const RECORDS: MaintainRecord[] = [kingLedger as MaintainRecord];

export function listMaintainRecords(): MaintainRecord[] {
  return RECORDS;
}

export function getMaintainRecord(id: string): MaintainRecord | null {
  return RECORDS.find((r) => r.id === id) ?? null;
}
