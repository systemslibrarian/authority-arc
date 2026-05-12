"use client";

import { useState } from "react";
import type { ClassifyRecord, FastHeading } from "@/lib/classify-records";

/**
 * FAST faceted visualization.
 *
 * The lesson is that the book sits at an *intersection* of independent
 * access points — not at a single location. The visualization groups the
 * FAST headings by facet (Topical, Geographic, Chronological, Form/Genre)
 * and renders each as a chip. The book lives where the chips meet.
 *
 * Clicking a heading opens its editorial note: facet-specific guidance on
 * what that heading does and doesn't tell the catalog.
 */
export function FastFacets({ record }: { record: ClassifyRecord }) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Group headings by facet, preserving the source order within each.
  const facets = new Map<string, FastHeading[]>();
  for (const h of record.fast.headings) {
    const arr = facets.get(h.facet) ?? [];
    arr.push(h);
    facets.set(h.facet, arr);
  }

  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-8">
      <header className="mb-6 flex items-baseline justify-between gap-3 border-b border-paper-edge pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
            FAST · faceted
          </div>
          <div className="mt-1 font-display text-[26px] font-[400] tracking-[-0.01em]">
            {record.fast.headings.length} access points
          </div>
          <div className="font-display text-[14.5px] italic text-ink-soft">
            across {facets.size} facets
          </div>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          One book ·{" "}
          <span className="text-oxblood">many headings</span>
          <br />
          <span className="text-[9.5px] normal-case tracking-normal text-ink-faint">
            an intersection in the graph
          </span>
        </div>
      </header>

      <div className="space-y-5">
        {Array.from(facets.entries()).map(([facet, headings]) => (
          <div key={facet}>
            <div className="mb-2 flex items-baseline gap-3">
              <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
                {facet}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
                {headings.length} {headings.length === 1 ? "heading" : "headings"}
              </span>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {headings.map((h: FastHeading) => {
                const open = openId === h.fastId;
                return (
                  <li key={h.fastId}>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : h.fastId)}
                      aria-expanded={open}
                      aria-controls={`fast-note-${h.fastId}`}
                      className={
                        "rounded-[2px] border px-3 py-1.5 text-left font-mono text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep " +
                        (open
                          ? "border-oxblood bg-oxblood/[.08] text-oxblood"
                          : "border-rule bg-paper text-ink hover:border-oxblood hover:text-oxblood")
                      }
                    >
                      <span className="font-display text-[14px]">{h.label}</span>
                      <span className="ml-2 text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
                        {h.fastId}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Render the open heading's note in a single area below to avoid
          shifting the facet chip layout on every interaction. */}
      <div className="mt-6 border-t border-paper-edge pt-5" aria-live="polite">
        {openId ? (
          <NoteFor record={record} openId={openId} />
        ) : (
          <p className="font-display text-[14.5px] italic text-ink-faint">
            Click a heading to see what it does — and doesn't — tell the
            catalog.
          </p>
        )}
      </div>

      <div className="mt-7 border-t border-paper-edge pt-5">
        <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
          Why this works
        </div>
        <p className="mt-2 font-display text-[15px] leading-[1.6] text-ink-soft">
          {record.fast.philosophy}
        </p>
      </div>
    </div>
  );
}

function NoteFor({
  record,
  openId,
}: {
  record: ClassifyRecord;
  openId: string;
}) {
  const heading = record.fast.headings.find((h) => h.fastId === openId);
  if (!heading) return null;
  return (
    <div
      id={`fast-note-${heading.fastId}`}
      className="border-l-[3px] border-oxblood bg-paper px-5 py-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="m-0 font-display text-[16px] font-[400] tracking-[-0.01em] text-ink">
          {heading.label}
        </h4>
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          {heading.facet} · {heading.fastId}
        </span>
      </div>
      <p className="mt-2 font-display text-[14.5px] leading-[1.6] text-ink">
        {heading.note}
      </p>
    </div>
  );
}
