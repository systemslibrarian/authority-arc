"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Stage 4 — entity search.
 *
 * Lets the visitor enter a Wikidata Q-identifier to load that entity's
 * neighborhood from the live SPARQL endpoint. Also offers a small set of
 * starter chips for famous figures so the visitor doesn't have to know
 * Wikidata's identifier syntax to start exploring.
 *
 * Submitting sets ?q=Qxxx in the URL and lets the page server-render
 * (via lib/wikidata.ts directly, no extra client fetch).
 */

const STARTER_ENTITIES = [
  { id: "Q39829",  label: "Stephen King",   tag: "horror author · curated" },
  { id: "Q1077",   label: "H. P. Lovecraft", tag: "cosmic-horror forerunner" },
  { id: "Q190050", label: "Shirley Jackson", tag: "psychological gothic" },
  { id: "Q40640",  label: "Ray Bradbury",    tag: "small-town fantastic" },
  { id: "Q42511",  label: "Virginia Woolf",  tag: "different field, denser graph" },
  { id: "Q44131",  label: "Ursula K. Le Guin", tag: "science fiction" },
];

export function EntitySearch({
  currentId,
  isCurated,
}: {
  currentId: string;
  isCurated: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState(currentId);
  const [error, setError] = useState<string | null>(null);

  function go(qid: string) {
    const trimmed = qid.trim().toUpperCase();
    if (!/^Q\d+$/.test(trimmed)) {
      setError("Wikidata IDs look like Q39829.");
      return;
    }
    setError(null);
    router.replace(`${pathname}?q=${trimmed}`, { scroll: false });
  }

  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(input);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <label
            htmlFor="wikidata-qid"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
          >
            Wikidata entity
          </label>
          <input
            id="wikidata-qid"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Q39829"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={
              "w-full rounded-[2px] border bg-paper px-4 py-3 font-mono text-[14px] uppercase tracking-[.05em] text-ink outline-none focus:ring-[3px] focus:ring-oxblood/20 " +
              (error ? "border-oxblood" : "border-rule focus:border-oxblood")
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "wikidata-qid-error" : undefined}
          />
          {error && (
            <p
              id="wikidata-qid-error"
              role="alert"
              className="mt-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-oxblood"
            >
              {error}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="tap-target w-full rounded-[2px] bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-eyebrow text-paper transition-colors hover:bg-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep sm:w-auto"
          >
            Walk<span aria-hidden="true"> →</span>
          </button>
        </div>
      </form>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
        Or try one of these
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STARTER_ENTITIES.map((e) => {
          const active = e.id.toUpperCase() === currentId.toUpperCase();
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => go(e.id)}
              aria-pressed={active}
              className={
                "rounded-[2px] border px-3 py-1.5 text-left font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep " +
                (active
                  ? "border-oxblood bg-oxblood/[.06] text-oxblood"
                  : "border-rule bg-paper text-ink hover:border-oxblood hover:text-oxblood")
              }
            >
              <span className="font-display text-[14px]">{e.label}</span>
              <span className="ml-2 text-[9.5px] uppercase tracking-eyebrow text-ink-faint">
                {e.id}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
        {isCurated ? (
          <>
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ochre" />
            <span>Curated · five relationship blocks; live Wikidata for any other entity</span>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[#b8d4a8]" />
            <span>Live · Wikidata SPARQL · notable-work, influenced-by, subject-of</span>
          </>
        )}
      </p>
    </div>
  );
}
