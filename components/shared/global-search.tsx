"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { classifySearchQuery, describeClassification } from "@/lib/search-classify";

/**
 * The strip-nav search bar.
 *
 * Accepts any of: a name, a Wikidata Q-id, an LCNAF identifier, a FAST
 * identifier, a BNF or BNE identifier, or a VIAF cluster number. The
 * classifier in lib/search-classify.ts decides where each shape of input
 * routes — entity identifiers go to Stage 1, Wikidata Q-ids go to Stage 4,
 * free-text names go to Stage 2's AutoSuggest.
 *
 * Visible affordance: a small live "kind →" hint appears under the input
 * as the visitor types, so the classification is legible before submission.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const id = useId();
  const classified = classifySearchQuery(query);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classified.path) return;
    router.push(classified.path);
    setQuery("");
  }

  return (
    <form
      role="search"
      aria-label="Search any name or identifier"
      onSubmit={onSubmit}
      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
    >
      <label htmlFor={id} className="sr-only">
        Search any name or identifier
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a name or ID"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 rounded-[2px] border border-rule bg-paper px-2.5 py-1 font-mono text-[11.5px] text-ink outline-none focus:border-oxblood focus:ring-[2px] focus:ring-oxblood/20 sm:w-[220px]"
        />
        <button
          type="submit"
          disabled={!classified.path}
          aria-label="Search"
          className="rounded-[2px] border border-ink bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-eyebrow text-paper transition-colors hover:bg-oxblood hover:border-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p
        aria-live="polite"
        className="min-h-[12px] font-mono text-[9.5px] uppercase tracking-eyebrow text-ink-faint"
      >
        {classified.kind !== "empty" && describeClassification(classified.kind)}
      </p>
    </form>
  );
}
