"use client";

import { useState } from "react";
import type { ClassifyRecord, DeweyLevel } from "@/lib/classify-records";

/**
 * Dewey tree visualization.
 *
 * The lesson is the *path*. A book in Dewey lives at one number, and that
 * number is the leaf of a single descending chain from 000–999 through
 * narrower and narrower categories. The visualization makes the chain
 * visible: each level expandable, with siblings shown to give context for
 * what else lives nearby.
 *
 * Clicking a level toggles its editorial note, which explains why that
 * level of the hierarchy exists — Dewey's idiosyncrasies are part of the
 * lesson, not noise to be hidden.
 */
export function DeweyTree({ record }: { record: ClassifyRecord }) {
  const [openLevel, setOpenLevel] = useState<string | null>(record.dewey.number);
  const [showSiblings, setShowSiblings] = useState(false);

  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-8">
      <header className="mb-6 flex items-baseline justify-between gap-3 border-b border-paper-edge pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
            Dewey Decimal · hierarchical
          </div>
          <div className="mt-1 font-display text-[26px] font-[400] tracking-[-0.01em]">
            {record.dewey.number}
          </div>
          <div className="font-display text-[14.5px] italic text-ink-soft">
            {record.dewey.label}
          </div>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          One book ·{" "}
          <span className="text-oxblood">one number</span>
          <br />
          <span className="text-[9.5px] normal-case tracking-normal text-ink-faint">
            one location in the tree
          </span>
        </div>
      </header>

      <ol className="m-0 list-none space-y-0 p-0">
        {record.dewey.path.map((level, i) => (
          <DeweyLevelRow
            key={level.number}
            level={level}
            depth={i}
            open={openLevel === level.number}
            onToggle={() =>
              setOpenLevel(openLevel === level.number ? null : level.number)
            }
            isLeaf={i === record.dewey.path.length - 1}
          />
        ))}
      </ol>

      <div className="mt-6 border-t border-paper-edge pt-5">
        <button
          type="button"
          onClick={() => setShowSiblings((s) => !s)}
          className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep"
          aria-expanded={showSiblings}
          aria-controls="dewey-siblings"
        >
          {showSiblings ? "Hide" : "Show"} siblings at {record.dewey.number}'s level
        </button>
        {showSiblings && (
          <ul
            id="dewey-siblings"
            className="mt-4 list-none space-y-1.5 p-0 font-mono text-[12.5px]"
          >
            {record.dewey.siblings.map((s) => (
              <li
                key={s.number}
                className="grid grid-cols-[76px_1fr] gap-3 text-ink-faint"
              >
                <span className="text-ink">{s.number}</span>
                <span>{s.label}</span>
              </li>
            ))}
            <li className="grid grid-cols-[76px_1fr] gap-3 border-t border-paper-edge pt-2 pt-2 font-display text-[12.5px] italic">
              <span className="text-oxblood font-mono not-italic">
                {record.dewey.number}
              </span>
              <span className="text-ink">{record.dewey.label} <em className="not-italic text-oxblood">← this book</em></span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function DeweyLevelRow({
  level,
  depth,
  open,
  onToggle,
  isLeaf,
}: {
  level: DeweyLevel;
  depth: number;
  open: boolean;
  onToggle: () => void;
  isLeaf: boolean;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full text-left transition-colors focus-visible:outline-none"
      >
        <div
          className="grid items-baseline gap-3 py-2"
          style={{
            gridTemplateColumns: `${depth * 16 + 12}px 84px 1fr auto`,
          }}
        >
          <span aria-hidden="true" className="font-mono text-[12px] text-oxblood">
            {isLeaf ? "●" : "└─"}
          </span>
          <span
            className={
              "font-mono text-[13px] " + (isLeaf ? "font-medium text-oxblood" : "text-ink")
            }
          >
            {level.number}
          </span>
          <span className="font-display text-[15px] leading-[1.3] text-ink">
            {level.label}
            {isLeaf && (
              <span className="ml-2 font-mono text-[9.5px] uppercase tracking-eyebrow text-oxblood">
                · this book
              </span>
            )}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
            {open ? "▾" : "▸"} {level.level}
          </span>
        </div>
      </button>
      {open && (
        <div
          className="ml-12 mr-2 mb-2 mt-1 border-l-[2px] border-oxblood/40 bg-paper px-4 py-3 font-display text-[14px] leading-[1.55] text-ink-soft"
          style={{ marginLeft: `${depth * 16 + 96}px` }}
        >
          {level.description}
        </div>
      )}
    </li>
  );
}
