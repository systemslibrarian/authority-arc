import { createHash } from "node:crypto";

/**
 * Tiny Merkle-tree builder, used by Stage 5 to compute a root over the
 * stewardship ledger.
 *
 * The lesson this primitive teaches is structural, not cryptographic:
 *   1. each ledger entry is hashed (SHA-256)
 *   2. pairs of hashes are concatenated and re-hashed up the tree
 *   3. the single hash at the top — the "root" — commits to every entry
 *   4. any one entry can be proven a member of the root using only the
 *      sibling hashes along its path (log₂(n) hashes for n entries)
 *
 * In production-grade authority systems this primitive would underwrite
 * the trust-layer proposal at the bottom of Stage 5 — institutions
 * publish Merkle roots co-signed with their peers, and downstream
 * consumers verify history against the public root without trusting any
 * single host. Stage 5 applies it to the page's own curated ledger as a
 * working demonstration; the federated piece is the proposal.
 *
 * This module is intentionally server-only: it uses node:crypto for hash
 * computation at build time, so the heavy lifting never reaches the
 * browser. The Merkle data is then passed to the client component as
 * plain JSON, where the browser re-verifies via SubtleCrypto.
 */

export interface MerkleSibling {
  /** Hex hash of the sibling node at this level. */
  hash: string;
  /** Whether the sibling sits to the left or right of the current node when concatenating up the tree. */
  side: "left" | "right";
}

export interface MerkleProof {
  /** Hex SHA-256 of the leaf's canonical serialization. */
  leafHash: string;
  /** Sibling hashes from leaf level up toward the root. */
  siblings: MerkleSibling[];
}

export interface MerkleTree<T> {
  /** Hex SHA-256 of the root node. */
  root: string;
  /** The leaves with their inclusion proofs attached. */
  leaves: Array<T & { merkleProof: MerkleProof }>;
  /** Hash algorithm used — fixed to "sha-256" for now. */
  algorithm: "sha-256";
}

/**
 * Build a Merkle tree over `items`. The serializer determines the
 * canonical form of each leaf — typically JSON.stringify with stable
 * key ordering. Items must have a stable order; the index of an item
 * is part of its proof.
 */
export function buildMerkleTree<T>(
  items: T[],
  serialize: (item: T) => string
): MerkleTree<T> {
  if (items.length === 0) {
    throw new Error("buildMerkleTree: cannot build a tree with zero items");
  }

  // Hash each leaf with a 0x00 domain-separation byte (Merkle leaves and
  // internal nodes use different prefixes so a leaf hash can never be
  // mistaken for an internal-node hash — the standard countermeasure for
  // the second-preimage attack on naive Merkle trees).
  const leafHashes = items.map((item) => sha256("\x00" + serialize(item)));

  // Build the tree levels bottom-up. If a level has an odd number of
  // nodes, the last node is duplicated rather than padded — Bitcoin-style.
  const levels: string[][] = [leafHashes];
  while (levels[levels.length - 1].length > 1) {
    const current = levels[levels.length - 1];
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? current[i];
      next.push(sha256("\x01" + left + right));
    }
    levels.push(next);
  }
  const root = levels[levels.length - 1][0];

  // Build per-leaf inclusion proofs.
  const leaves = items.map((item, i) => {
    const siblings: MerkleSibling[] = [];
    let idx = i;
    for (let level = 0; level < levels.length - 1; level++) {
      const isRight = idx % 2 === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      const siblingHash =
        levels[level][siblingIdx] ?? levels[level][idx];
      siblings.push({
        hash: siblingHash,
        side: isRight ? "left" : "right",
      });
      idx = Math.floor(idx / 2);
    }
    return {
      ...item,
      merkleProof: {
        leafHash: leafHashes[i],
        siblings,
      },
    };
  });

  return { root, leaves, algorithm: "sha-256" };
}

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Canonical serialization for a ledger entry. Stable across runs because
 * we never rely on object key iteration order — every field is named
 * explicitly. Change this serializer and every Merkle root recomputes.
 */
export function serializeLedgerEntry(entry: {
  year: string;
  type: string;
  actor: string;
  title: string;
  detail: string;
  significance: string;
}): string {
  return [
    `year:${entry.year}`,
    `type:${entry.type}`,
    `actor:${entry.actor}`,
    `title:${entry.title}`,
    `detail:${entry.detail}`,
    `significance:${entry.significance}`,
  ].join("\n");
}
