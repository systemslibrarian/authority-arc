"use client";

import { useState } from "react";
import type { ConnectRecord, Neighbor, Relationship } from "@/lib/connect-records";

/**
 * Stage 4 — neighborhood walk.
 *
 * The rendering is deliberately not a force-directed graph. Generic graph
 * visualizations look impressive and teach almost nothing: they reduce every
 * edge to a line and lose the relationship's meaning. Here, edges are
 * grouped *by what they assert*, and each group carries its own editorial
 * note explaining what that kind of edge tells the catalog and why the
 * neighborhood is sparse or dense at that edge type.
 */
export function Neighborhood({ record }: { record: ConnectRecord }) {
  const [openRel, setOpenRel] = useState<string | null>(record.relationships[0]?.type ?? null);

  return (
    <div className="space-y-6">
      <EntityCard record={record} />
      <div className="grid gap-4">
        {record.relationships.map((rel) => (
          <RelationshipBlock
            key={rel.type}
            relationship={rel}
            open={openRel === rel.type}
            onToggle={() => setOpenRel(openRel === rel.type ? null : rel.type)}
          />
        ))}
      </div>
      <SparsityNote text={record.sparsityNote} />
    </div>
  );
}

function EntityCard({ record }: { record: ConnectRecord }) {
  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-8">
      <div className="grid items-start gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
            Center of the walk
          </div>
          <div className="mt-1 font-display text-[28px] font-[400] leading-[1.1] tracking-[-0.01em]">
            {record.entity.name}
          </div>
          <div className="mt-1 font-mono text-[11px] text-ink-faint">
            b. {record.entity.birthYear}
            {record.entity.deathYear && ` · d. ${record.entity.deathYear}`}
          </div>
        </div>
        <div>
          <p className="font-display text-[15.5px] leading-[1.55] text-ink">
            {record.entity.summary}
          </p>
          <dl className="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1 font-mono text-[11.5px]">
            <dt className="text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
              Wikidata
            </dt>
            <dd className="text-ink">{record.entity.wikidata}</dd>
            <dt className="text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
              VIAF
            </dt>
            <dd className="text-ink">{record.entity.viaf}</dd>
            <dt className="text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
              LC
            </dt>
            <dd className="text-ink">{record.entity.lc}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function RelationshipBlock({
  relationship,
  open,
  onToggle,
}: {
  relationship: Relationship;
  open: boolean;
  onToggle: () => void;
}) {
  const count = relationship.neighbors.length;
  return (
    <section
      aria-labelledby={`rel-${relationship.type}-title`}
      className="rounded-[2px] border border-paper-edge bg-paper-deep shadow-paper"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`rel-${relationship.type}-body`}
        className="block w-full px-5 py-4 text-left sm:px-8 sm:py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3
              id={`rel-${relationship.type}-title`}
              className="m-0 font-display text-[22px] font-[400] tracking-[-0.01em] text-ink"
            >
              {relationship.title}
            </h3>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
              {relationship.predicate}
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            {count} {count === 1 ? "edge" : "edges"}{" "}
            <span aria-hidden="true" className="ml-1">{open ? "▾" : "▸"}</span>
          </div>
        </div>
      </button>

      {open && (
        <div id={`rel-${relationship.type}-body`} className="px-5 pb-6 sm:px-8">
          <p className="border-l-[3px] border-oxblood bg-paper px-5 py-4 font-display text-[14.5px] leading-[1.6] text-ink-soft">
            {relationship.explanation}
          </p>
          <ul className="mt-5 grid list-none gap-2 p-0 sm:grid-cols-2">
            {relationship.neighbors.map((n, i) => (
              <NeighborChip key={i} neighbor={n} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function NeighborChip({ neighbor }: { neighbor: Neighbor }) {
  return (
    <li className="rounded-[2px] border border-rule bg-paper px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[15px] font-[400] text-ink">
          {neighbor.label}
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-eyebrow text-oxblood">
          {neighbor.wikidata
            ? neighbor.wikidata
            : neighbor.fastId
            ? neighbor.fastId
            : neighbor.year
            ? neighbor.year
            : neighbor.type
            ? neighbor.type
            : ""}
        </span>
      </div>
      {neighbor.note && (
        <p className="mt-1 font-display text-[13px] italic leading-[1.5] text-ink-soft">
          {neighbor.note}
        </p>
      )}
      {neighbor.year && neighbor.wikidata && (
        <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
          {neighbor.year}
        </p>
      )}
    </li>
  );
}

function SparsityNote({ text }: { text: string }) {
  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper p-5 sm:p-7">
      <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
        Why graphs are sparse
      </div>
      <p className="mt-2 font-display text-[15.5px] leading-[1.6] text-ink-soft">
        {text}
      </p>
    </div>
  );
}
