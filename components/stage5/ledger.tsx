"use client";

import { useState } from "react";
import type {
  LedgerEntryType,
  MerkleizedEntry,
  MerkleizedRecord,
} from "@/lib/maintain-records";
import type { MerkleSibling } from "@/lib/merkle";

/**
 * Stage 5 — stewardship ledger with a working Merkle root.
 *
 * The ledger renders as a timeline of catalog changes; alongside each
 * row, the component exposes the cryptographic inclusion proof that
 * proves the row's membership in the published root. The root itself
 * is computed at build time over the canonical serialization of every
 * entry (see lib/merkle.ts), then re-verified in the browser via
 * SubtleCrypto when the visitor clicks "verify".
 *
 * The lesson is structural: the proposal at the bottom of Stage 5 is
 * "Merkle-rooted history with signed peer commitments." Authority Arc
 * itself does the Merkle half over its own data, honestly. The signed
 * federated half remains the proposal.
 */
export function Ledger({ record }: { record: MerkleizedRecord }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep shadow-paper">
      <header className="border-b border-paper-edge p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
              Stewardship ledger
            </div>
            <div className="mt-1 font-display text-[24px] font-[400] tracking-[-0.01em]">
              {record.record.entity.name}
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            {record.entries.length} entries · since{" "}
            {record.record.entity.established}
          </div>
        </div>
        <p className="mt-3 font-mono text-[11.5px] text-ink-faint">
          VIAF {record.record.entity.viaf} · LC {record.record.entity.lc}
        </p>

        <MerkleRootBanner
          root={record.merkleRoot}
          algorithm={record.merkleAlgorithm}
          entryCount={record.entries.length}
        />
      </header>

      <ol className="m-0 list-none divide-y divide-paper-edge p-0">
        {record.entries.map((entry, i) => (
          <LedgerRow
            key={i}
            entry={entry}
            root={record.merkleRoot}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </ol>
    </div>
  );
}

function MerkleRootBanner({
  root,
  algorithm,
  entryCount,
}: {
  root: string;
  algorithm: "sha-256";
  entryCount: number;
}) {
  return (
    <div className="mt-5 rounded-[2px] border border-rule bg-paper px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
          Published Merkle root · {algorithm}
        </div>
        <div className="font-mono text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
          Commits to all {entryCount} entries
        </div>
      </div>
      <div className="mt-1.5 break-all font-mono text-[11.5px] leading-[1.45] text-ink">
        {root}
      </div>
      <p className="mt-2 font-display text-[13px] italic leading-[1.5] text-ink-soft">
        Every entry below carries the sibling hashes needed to prove it is
        a member of this root. Expand any entry and click{" "}
        <span className="not-italic font-mono text-[11.5px] text-oxblood">
          verify
        </span>{" "}
        — the browser recomputes the root from the entry up the tree and
        confirms the match.
      </p>
    </div>
  );
}

function LedgerRow({
  entry,
  root,
  open,
  onToggle,
}: {
  entry: MerkleizedEntry;
  root: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full px-5 py-4 text-left transition-colors hover:bg-paper sm:px-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
      >
        <div className="grid items-baseline gap-3 sm:grid-cols-[80px_120px_1fr_auto]">
          <span className="font-mono text-[14px] text-oxblood">
            {entry.year}
          </span>
          <span>
            <TypeBadge type={entry.type} />
          </span>
          <span className="font-display text-[16px] leading-[1.35] text-ink">
            {entry.title}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
              · {entry.actor}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
          >
            {open ? "▾" : "▸"}
          </span>
        </div>
      </button>
      {open && (
        <div className="border-l-[3px] border-oxblood bg-paper px-5 pb-5 pt-1 sm:px-8">
          <p className="font-display text-[15px] leading-[1.6] text-ink">
            {entry.detail}
          </p>
          <p className="mt-3 border-t border-paper-edge pt-3 font-display text-[14.5px] italic leading-[1.6] text-ink-soft">
            {entry.significance}
          </p>
          <InclusionProofPanel
            leafHash={entry.merkleProof.leafHash}
            siblings={entry.merkleProof.siblings}
            expectedRoot={root}
          />
        </div>
      )}
    </li>
  );
}

function InclusionProofPanel({
  leafHash,
  siblings,
  expectedRoot,
}: {
  leafHash: string;
  siblings: MerkleSibling[];
  expectedRoot: string;
}) {
  type VerifyState =
    | { kind: "idle" }
    | { kind: "verifying" }
    | { kind: "verified"; computedRoot: string; match: boolean }
    | { kind: "error"; message: string };

  const [state, setState] = useState<VerifyState>({ kind: "idle" });

  async function onVerify() {
    setState({ kind: "verifying" });
    try {
      const computedRoot = await recomputeRoot(leafHash, siblings);
      setState({
        kind: "verified",
        computedRoot,
        match: computedRoot === expectedRoot,
      });
    } catch (e: any) {
      setState({
        kind: "error",
        message: e?.message ?? "Verification failed",
      });
    }
  }

  return (
    <div className="mt-5 rounded-[2px] border border-paper-edge bg-paper-deep p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
          Inclusion proof · {siblings.length} sibling{siblings.length === 1 ? "" : "s"}
        </div>
        <button
          type="button"
          onClick={onVerify}
          disabled={state.kind === "verifying"}
          className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-ink transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep disabled:opacity-60"
        >
          {state.kind === "verifying"
            ? "Verifying…"
            : state.kind === "verified" && state.match
            ? "✓ verified"
            : "Verify"}
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 font-mono text-[10.5px] leading-[1.45]">
        <dt className="text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
          Leaf hash
        </dt>
        <dd className="break-all text-ink">{leafHash}</dd>
        {siblings.map((sib, i) => (
          <SiblingRow key={i} index={i} sibling={sib} />
        ))}
      </dl>

      {state.kind === "verified" && (
        <div
          className={
            "mt-4 rounded-[2px] border-l-[3px] bg-paper px-4 py-3 " +
            (state.match ? "border-[#5a7a3a]" : "border-oxblood")
          }
        >
          <div
            className={
              "font-mono text-[10px] uppercase tracking-eyebrow " +
              (state.match ? "text-[#3f5a2a]" : "text-oxblood")
            }
          >
            {state.match ? "✓ Inclusion verified" : "✗ Inclusion failed"}
          </div>
          <p className="mt-2 break-all font-mono text-[10.5px] leading-[1.45] text-ink">
            <span className="text-ink-faint">Recomputed root: </span>
            {state.computedRoot}
          </p>
          {state.match ? (
            <p className="mt-2 font-display text-[13px] italic leading-[1.5] text-ink-soft">
              The browser concatenated the leaf hash with each sibling
              (left or right as recorded), SHA-256'd up the tree, and
              landed on the published root. This entry is a verified
              member of the ledger.
            </p>
          ) : (
            <p className="mt-2 font-display text-[13px] italic leading-[1.5] text-ink-soft">
              The recomputed root does not match the published root.
              Either the proof, the leaf, or the published root has been
              tampered with.
            </p>
          )}
        </div>
      )}
      {state.kind === "error" && (
        <p className="mt-3 font-mono text-[11px] text-oxblood">
          {state.message}
        </p>
      )}
    </div>
  );
}

function SiblingRow({
  index,
  sibling,
}: {
  index: number;
  sibling: MerkleSibling;
}) {
  return (
    <>
      <dt className="text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
        Sib {index + 1} ·{" "}
        <span className="text-oxblood">{sibling.side}</span>
      </dt>
      <dd className="break-all text-ink">{sibling.hash}</dd>
    </>
  );
}

/**
 * Recompute the Merkle root from a leaf hash and its sibling path,
 * using the browser's SubtleCrypto. Mirrors the build-time computation
 * in lib/merkle.ts — same 0x01 internal-node domain separator.
 */
async function recomputeRoot(
  leafHash: string,
  siblings: MerkleSibling[]
): Promise<string> {
  let current = leafHash;
  for (const sib of siblings) {
    const combined =
      sib.side === "left" ? sib.hash + current : current + sib.hash;
    current = await sha256Hex("\x01" + combined);
  }
  return current;
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function TypeBadge({ type }: { type: LedgerEntryType }) {
  const styles: Record<LedgerEntryType, { border: string; text: string; label: string }> = {
    created: { border: "border-[#5a7a3a]", text: "text-[#3f5a2a]", label: "Created" },
    linked: { border: "border-oxblood", text: "text-oxblood", label: "Linked" },
    "added-source": { border: "border-indigo", text: "text-indigo", label: "Added" },
    merged: { border: "border-oxblood", text: "text-oxblood", label: "Merged" },
    split: { border: "border-ochre-deep", text: "text-ochre-deep", label: "Split" },
    deprecated: { border: "border-ink-faint", text: "text-ink-faint", label: "Deprecated" },
    normalized: { border: "border-indigo", text: "text-indigo", label: "Normalized" },
    corrected: { border: "border-ochre-deep", text: "text-ochre-deep", label: "Corrected" },
  };
  const s = styles[type];
  return (
    <span
      className={
        "inline-block rounded-[2px] border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-eyebrow " +
        s.border +
        " " +
        s.text
      }
    >
      {s.label}
    </span>
  );
}
