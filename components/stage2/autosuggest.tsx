"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AutoSuggestHit, AutoSuggestResponse, ResolveError } from "@/lib/types";

/**
 * Stage 2 — AutoSuggest typeahead.
 *
 * Hits /api/autosuggest live as the visitor types. Debounced 220ms so VIAF
 * isn't pelted on every keystroke. Renders an ARIA combobox so keyboard and
 * screen-reader users can navigate hits the same way they would with native
 * `<datalist>` elements.
 *
 * The point of this component is the *gesture*: type a free-text name, watch
 * dozens of candidate clusters appear ranked by VIAF's own confidence
 * scoring. The hits are not directly actionable — selecting one logs the
 * choice and clears the search. The pedagogical work is the visible shape of
 * disambiguation, not a routing flow.
 */

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; data: AutoSuggestResponse }
  | { kind: "error"; error: ResolveError };

interface AutoSuggestProps {
  /** Seed query so the typeahead is non-empty on first render. */
  initial?: string;
}

export function AutoSuggest({ initial = "stephen king" }: AutoSuggestProps) {
  const [query, setQuery] = useState(initial);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [selected, setSelected] = useState<AutoSuggestHit | null>(null);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const lastRequestedQuery = useRef<string>("");

  const fetchHits = useCallback(async (q: string) => {
    lastRequestedQuery.current = q;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/autosuggest?q=${encodeURIComponent(q)}`);
      // If a newer query has been issued, drop this stale response.
      if (lastRequestedQuery.current !== q) return;
      if (!res.ok) {
        const err = (await res.json()) as ResolveError;
        setState({ kind: "error", error: err });
        return;
      }
      const data = (await res.json()) as AutoSuggestResponse;
      setState({ kind: "loaded", data });
      setActiveIndex(-1);
    } catch (e: any) {
      if (lastRequestedQuery.current !== q) return;
      setState({
        kind: "error",
        error: {
          error: true,
          status: 0,
          code: "UNKNOWN",
          message: e?.message ?? "Network error",
        },
      });
    }
  }, []);

  // Debounce queries to 220ms; clear results below 2 chars.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setState({ kind: "idle" });
      return;
    }
    const handle = setTimeout(() => fetchHits(trimmed), 220);
    return () => clearTimeout(handle);
  }, [query, fetchHits]);

  const hits =
    state.kind === "loaded" ? state.data.hits.slice(0, 12) : [];

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? hits.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectHit(hits[activeIndex]);
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  }

  function selectHit(hit: AutoSuggestHit) {
    setSelected(hit);
    setQuery(hit.label);
    setActiveIndex(-1);
    setState({ kind: "idle" });
  }

  return (
    <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-9">
      <label
        htmlFor={inputId}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
      >
        Type any name
      </label>
      <div
        role="combobox"
        aria-expanded={hits.length > 0}
        aria-haspopup="listbox"
        aria-owns={listboxId}
      >
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          aria-busy={state.kind === "loading"}
          className="w-full rounded-[2px] border border-rule bg-paper px-4 py-3 font-mono text-[15px] text-ink outline-none focus:border-oxblood focus:ring-[3px] focus:ring-oxblood/20"
          placeholder="stephen king"
        />
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
        {state.kind === "loading" && "Searching VIAF…"}
        {state.kind === "loaded" &&
          `${state.data.hits.length} ranked cluster${state.data.hits.length === 1 ? "" : "s"} · VIAF AutoSuggest`}
        {state.kind === "error" &&
          `VIAF unreachable · ${state.error.message}`}
        {state.kind === "idle" &&
          (selected
            ? `Locked in: ${selected.label} · VIAF ${selected.viafId}`
            : query.trim().length < 2
            ? "Two or more characters."
            : "Type to search.")}
      </p>

      {hits.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="VIAF cluster suggestions"
          className="mt-5 max-h-[440px] list-none overflow-y-auto p-0"
        >
          {hits.map((hit, i) => {
            const isActive = i === activeIndex;
            return (
              <li
                key={hit.viafId}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  onClick={() => selectHit(hit)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={
                    "block w-full border-b border-paper-edge px-3 py-2.5 text-left font-mono text-[12.5px] transition-colors last:border-b-0 focus-visible:outline-none " +
                    (isActive
                      ? "bg-oxblood/[.06] text-ink"
                      : "text-ink hover:bg-oxblood/[.04]")
                  }
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display text-[16px] font-[400] text-ink">
                      {hit.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
                      VIAF {hit.viafId}
                      {hit.nameType && (
                        <span className="ml-2 text-oxblood">
                          · {hit.nameType}
                        </span>
                      )}
                    </span>
                  </div>
                  <IdentifierChips identifiers={hit.identifiers} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {state.kind === "loaded" && hits.length === 0 && (
        <p className="mt-5 font-display text-[15px] italic text-ink-faint">
          No clusters match <span className="not-italic">"{query}"</span>. VIAF
          AutoSuggest does prefix matching on the indexed name form — try a
          different spelling or initial.
        </p>
      )}
    </div>
  );
}

function IdentifierChips({
  identifiers,
}: {
  identifiers?: AutoSuggestHit["identifiers"];
}) {
  if (!identifiers) return null;
  const entries = Object.entries(identifiers).filter(
    ([, v]) => typeof v === "string" && v.length > 0
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="rounded-[2px] border border-rule px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-eyebrow text-ink-faint"
        >
          <span className="text-oxblood">{k}</span>
          <span className="ml-1 normal-case tracking-normal">{v}</span>
        </span>
      ))}
    </div>
  );
}
