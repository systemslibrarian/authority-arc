"use client";

import { useState } from "react";
import type {
  LedgerEntry,
  LedgerEntryType,
  MaintainRecord,
} from "@/lib/maintain-records";

/**
 * Stage 5 — stewardship ledger.
 *
 * A timeline of catalog changes to one identity. Each entry expands to
 * reveal the editorial note on why that kind of change matters. The
 * visualization is intentionally a *ledger*, not a graph or timeline: the
 * point of Stage 5 is that maintenance is bookkeeping — institutional,
 * dated, attributable — not an algorithm.
 */
export function Ledger({ record }: { record: MaintainRecord }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep shadow-paper">
      <header className="border-b border-paper-edge p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
              Stewardship ledger
            </div>
            <div className="mt-1 font-display text-[24px] font-[400] tracking-[-0.01em]">
              {record.entity.name}
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            {record.entries.length} entries · since {record.entity.established}
          </div>
        </div>
        <p className="mt-3 font-mono text-[11.5px] text-ink-faint">
          VIAF {record.entity.viaf} · LC {record.entity.lc}
        </p>
      </header>

      <ol className="m-0 list-none divide-y divide-paper-edge p-0">
        {record.entries.map((entry, i) => (
          <LedgerRow
            key={i}
            entry={entry}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </ol>
    </div>
  );
}

function LedgerRow({
  entry,
  open,
  onToggle,
}: {
  entry: LedgerEntry;
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
        </div>
      )}
    </li>
  );
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
