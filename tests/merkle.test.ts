import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { buildMerkleTree } from "@/lib/merkle";

/**
 * Merkle tree unit tests.
 *
 * These verify the build-time tree construction and per-leaf inclusion
 * proofs. The browser-side recomputation lives in Stage 5's Ledger
 * component and uses the same algorithm with SubtleCrypto.
 */

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function recomputeRoot(
  leafHash: string,
  siblings: Array<{ hash: string; side: "left" | "right" }>
): string {
  let current = leafHash;
  for (const sib of siblings) {
    const combined =
      sib.side === "left" ? sib.hash + current : current + sib.hash;
    current = sha256Hex("\x01" + combined);
  }
  return current;
}

describe("buildMerkleTree", () => {
  const serialize = (s: string) => s;

  it("returns a 64-char hex SHA-256 root", () => {
    const tree = buildMerkleTree(["a", "b", "c", "d"], serialize);
    expect(tree.root).toMatch(/^[0-9a-f]{64}$/);
    expect(tree.algorithm).toBe("sha-256");
  });

  it("attaches an inclusion proof to every leaf", () => {
    const tree = buildMerkleTree(["a", "b", "c", "d"], serialize);
    expect(tree.leaves).toHaveLength(4);
    for (const leaf of tree.leaves) {
      expect(leaf.merkleProof.leafHash).toMatch(/^[0-9a-f]{64}$/);
      expect(leaf.merkleProof.siblings.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("each leaf's proof reproduces the root when walked up the tree", () => {
    const items = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta"];
    const tree = buildMerkleTree(items, serialize);
    for (const leaf of tree.leaves) {
      const recomputed = recomputeRoot(
        leaf.merkleProof.leafHash,
        leaf.merkleProof.siblings
      );
      expect(recomputed).toBe(tree.root);
    }
  });

  it("uses 0x00 leaf / 0x01 internal-node domain separation", () => {
    // A two-leaf tree's root should equal sha256("\x01" + leafA + leafB)
    // where leafA = sha256("\x00" + "a") and leafB = sha256("\x00" + "b").
    const tree = buildMerkleTree(["a", "b"], serialize);
    const leafA = sha256Hex("\x00a");
    const leafB = sha256Hex("\x00b");
    const expectedRoot = sha256Hex("\x01" + leafA + leafB);
    expect(tree.root).toBe(expectedRoot);
    expect(tree.leaves[0].merkleProof.leafHash).toBe(leafA);
    expect(tree.leaves[1].merkleProof.leafHash).toBe(leafB);
  });

  it("a tampered leaf no longer verifies against the root", () => {
    const tree = buildMerkleTree(["a", "b", "c", "d"], serialize);
    const leaf = tree.leaves[1];
    const tamperedLeafHash = sha256Hex("\x00not-b");
    const recomputed = recomputeRoot(tamperedLeafHash, leaf.merkleProof.siblings);
    expect(recomputed).not.toBe(tree.root);
  });

  it("handles odd-sized leaf counts by duplicating the last node", () => {
    const odd = buildMerkleTree(["a", "b", "c"], serialize);
    // Verify every leaf still produces the root.
    for (const leaf of odd.leaves) {
      const recomputed = recomputeRoot(
        leaf.merkleProof.leafHash,
        leaf.merkleProof.siblings
      );
      expect(recomputed).toBe(odd.root);
    }
  });

  it("a single-leaf tree's root equals the leaf hash itself", () => {
    const tree = buildMerkleTree(["solo"], serialize);
    expect(tree.root).toBe(sha256Hex("\x00solo"));
    expect(tree.leaves[0].merkleProof.siblings).toHaveLength(0);
  });

  it("throws on empty input rather than returning a useless root", () => {
    expect(() => buildMerkleTree([], serialize)).toThrow();
  });
});
