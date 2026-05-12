"use client";

import { useState } from "react";
import type { DisambiguationCase, DisambiguationRecord } from "@/lib/disambiguation-cases";

/**
 * Vote-then-reveal widget for Stage 2.
 *
 * The visitor sees two authority records side-by-side, decides whether they
 * describe the same person, then sees what VIAF actually decided plus the
 * evidence catalogers used. The pedagogical move is to make the visitor
 * *commit* to an answer before reading the reveal — that's what makes the
 * lesson stick.
 *
 * Each case is independent state. Selecting an answer is a one-way operation
 * for that case (a "Reset" button is provided for those who want a second
 * pass).
 */

type Vote = "same" | "different";

interface Props {
  cases: DisambiguationCase[];
}

export function VoteReveal({ cases }: Props) {
  return (
    <div className="flex flex-col gap-12">
      {cases.map((c) => (
        <CaseBlock key={c.id} caseData={c} />
      ))}
    </div>
  );
}

function CaseBlock({ caseData }: { caseData: DisambiguationCase }) {
  const [vote, setVote] = useState<Vote | null>(null);
  const revealed = vote !== null;
  const correct =
    vote === "same"
      ? caseData.kind === "merge"
      : vote === "different"
      ? caseData.kind === "split"
      : false;

  return (
    <article
      aria-labelledby={`case-${caseData.id}-prompt`}
      className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-8"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h3
          id={`case-${caseData.id}-prompt`}
          className="m-0 font-display text-[22px] font-[380] tracking-[-0.01em] sm:text-[24px]"
        >
          {caseData.prompt}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Case {caseData.id}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <RecordCard record={caseData.leftRecord} side="A" />
        <RecordCard record={caseData.rightRecord} side="B" />
      </div>

      {!revealed && (
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            Your call
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setVote("same")}
              className="tap-target flex-1 rounded-[2px] border border-rule bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-eyebrow text-ink transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep"
            >
              Same person
            </button>
            <button
              type="button"
              onClick={() => setVote("different")}
              className="tap-target flex-1 rounded-[2px] border border-rule bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-eyebrow text-ink transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep"
            >
              Two different people
            </button>
          </div>
        </div>
      )}

      {revealed && (
        <DecisionReveal caseData={caseData} vote={vote!} correct={correct} onReset={() => setVote(null)} />
      )}
    </article>
  );
}

function RecordCard({
  record,
  side,
}: {
  record: DisambiguationRecord;
  side: "A" | "B";
}) {
  return (
    <div className="rounded-[2px] border border-rule bg-paper p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
          Record {side}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-faint">
          {record.curator} · {record.recordId}
        </span>
      </div>
      <div className="font-display text-[20px] font-[400] leading-[1.15] tracking-[-0.01em] text-ink">
        {record.heading}
      </div>
      <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 font-mono text-[12px] text-ink">
        <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Dates
        </dt>
        <dd>
          {record.birthYear}–{record.deathYear}
        </dd>
        <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Nationality
        </dt>
        <dd>{record.nationality}</dd>
        <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Field
        </dt>
        <dd className="font-display text-[13px]">{record.field}</dd>
        <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Curator
        </dt>
        <dd className="font-display text-[13px] text-ink-faint">
          {record.curatorLabel}
        </dd>
      </dl>
      <div className="mt-4 border-t border-paper-edge pt-3">
        <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Known for
        </div>
        <ul className="mt-1.5 list-none space-y-0.5 p-0 font-display text-[13.5px] leading-[1.45] text-ink">
          {record.knownFor.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
      {record.alternativeNames.length > 0 && (
        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            Cross-references
          </div>
          <ul className="mt-1 list-none p-0 font-mono text-[11.5px] text-ink-faint">
            {record.alternativeNames.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DecisionReveal({
  caseData,
  vote,
  correct,
  onReset,
}: {
  caseData: DisambiguationCase;
  vote: Vote;
  correct: boolean;
  onReset: () => void;
}) {
  const decision = caseData.viafDecision;
  return (
    <div
      role="region"
      aria-label="VIAF decision"
      className="mt-6 animate-fade-up border-l-[3px] border-oxblood bg-paper px-5 py-5 sm:px-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-oxblood">
            VIAF's call
          </span>
          <span className="font-display text-[20px] font-[400] tracking-[-0.01em] text-ink">
            {decision.answer === "merge"
              ? "Same person — merged"
              : "Two different people — held apart"}
          </span>
        </div>
        <span
          className={
            "rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-eyebrow " +
            (correct
              ? "border-[#5a7a3a] text-[#3f5a2a]"
              : "border-ochre-deep text-ochre-deep")
          }
        >
          You said: {vote === "same" ? "same" : "different"} ·{" "}
          {correct ? "agrees with VIAF" : "diverges from VIAF"}
        </span>
      </div>

      {decision.answer === "merge" && decision.viafCluster && (
        <p className="mt-3 font-mono text-[12px] text-ink-faint">
          Cluster:{" "}
          <span className="text-oxblood">VIAF {decision.viafCluster}</span>
          {decision.preferredHeading && (
            <>
              {" · preferred heading: "}
              <span className="font-display text-[13.5px] italic text-ink">
                {decision.preferredHeading}
              </span>
            </>
          )}
        </p>
      )}
      {decision.answer === "split" &&
        decision.leftViafCluster &&
        decision.rightViafCluster && (
          <p className="mt-3 font-mono text-[12px] text-ink-faint">
            Distinct clusters:{" "}
            <span className="text-oxblood">VIAF {decision.leftViafCluster}</span>
            {" and "}
            <span className="text-oxblood">VIAF {decision.rightViafCluster}</span>
          </p>
        )}

      <div className="mt-5">
        <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          Evidence
        </div>
        <ol className="mt-2 list-none space-y-2 p-0">
          {decision.evidence.map((e, i) => (
            <li
              key={i}
              className="grid grid-cols-[24px_1fr] gap-3 font-display text-[14.5px] leading-[1.5] text-ink"
            >
              <span className="pt-0.5 font-mono text-[11px] text-oxblood">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{e}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 border-t border-paper-edge pt-4 font-display text-[14.5px] italic leading-[1.6] text-ink-soft">
        {caseData.explanation}
      </p>

      <div className="mt-5">
        <button
          type="button"
          onClick={onReset}
          className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Reset vote
        </button>
      </div>
    </div>
  );
}
