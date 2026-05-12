import kingLedger from "@/data/fixtures/maintain/king-ledger.json";
import { buildMerkleTree, serializeLedgerEntry, type MerkleProof } from "@/lib/merkle";

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

export interface MerkleizedEntry extends LedgerEntry {
  merkleProof: MerkleProof;
}

export interface MerkleizedRecord {
  record: MaintainRecord;
  merkleRoot: string;
  merkleAlgorithm: "sha-256";
  entries: MerkleizedEntry[];
}

/**
 * Take a maintain record and return it with a Merkle tree computed over
 * its ledger entries. The root commits to every entry; each entry carries
 * its own inclusion proof so the browser can re-verify.
 *
 * This is the working demonstration of the Stage 5 trust-layer proposal,
 * applied to our own curated ledger. (The federated piece — multiple
 * institutions co-signing a shared root — is the part Stage 5 still
 * frames as a proposal.)
 */
export function merkleizeRecord(record: MaintainRecord): MerkleizedRecord {
  const tree = buildMerkleTree(record.entries, serializeLedgerEntry);
  return {
    record,
    merkleRoot: tree.root,
    merkleAlgorithm: tree.algorithm,
    entries: tree.leaves,
  };
}
