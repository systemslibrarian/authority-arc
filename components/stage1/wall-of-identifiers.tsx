"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The wall of identifiers — Exhibit A on Stage 1.
 *
 * The point of this component is *not* to be a directory of King's identifiers
 * (we have the resolver below for that). The point is the *gesture*: a cloud
 * of identifier scraps, lines drawn from each to the named entity in the center,
 * with two lines deliberately rendered as "disagreement" in oxblood.
 *
 * The disagreement is real: across 50+ source authorities, VIAF clusters do
 * sometimes split or get re-merged. We don't claim *these specific* two are
 * wrong — Stage 1 plants the idea; Stage 2 examines actual disagreement cases.
 * The page copy is honest about this in the "What's faked" disclosure.
 */

const CHITS = [
  { scheme: "LCNAF · dlcnames",  value: "n79018049",                left: "4%",  top: "8%",  rot: "-2deg", delay: 0.10 },
  { scheme: "VIAF cluster",      value: "27066711",                 left: "18%", top: "32%", rot: "1deg",  delay: 0.25 },
  { scheme: "ISNI",              value: "0000 0001 2103 2683",      left: "2%",  top: "56%", rot: "-1deg", delay: 0.40 },
  { scheme: "FAST · personal",   value: "fst00041201",              left: "12%", top: "80%", rot: "2deg",  delay: 0.55 },
  { scheme: "BNF · France",      value: "cb11909418n",              left: "38%", top: "6%",  rot: "1deg",  delay: 0.70 },
  { scheme: "DNB · Germany",     value: "118562525",                left: "62%", top: "4%",  rot: "-2deg", delay: 0.15 },
  { scheme: "BNE · Spain",       value: "XX1058570",                left: "80%", top: "14%", rot: "1deg",  delay: 0.30 },
  { scheme: "NDL · Japan",       value: "00446920",                 left: "84%", top: "38%", rot: "-1deg", delay: 0.45 },
  { scheme: "Wikidata",          value: "Q39829",                   left: "80%", top: "64%", rot: "2deg",  delay: 0.60 },
  { scheme: "OCLC Entity URI",   value: "E39PBJqv...8mF",           left: "64%", top: "84%", rot: "-1deg", delay: 0.75 },
  { scheme: "NLA · Australia",   value: "35867891",                 left: "38%", top: "86%", rot: "1deg",  delay: 0.90 },
  { scheme: "CAOONL · Canada",   value: "ncf10358912",              left: "24%", top: "60%", rot: "-2deg", delay: 1.05 },
];

// Which chit indices are drawn as "disagreement" lines (oxblood).
const DISAGREEMENT = new Set([6, 11]);

interface Line {
  x1: number; y1: number; x2: number; y2: number; miss: boolean; delay: number;
}

export function WallOfIdentifiers() {
  const wallRef = useRef<HTMLDivElement>(null);
  const specimenRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    function drawLines() {
      const wall = wallRef.current;
      const spec = specimenRef.current;
      if (!wall || !spec) return;
      const wRect = wall.getBoundingClientRect();
      const sRect = spec.getBoundingClientRect();
      // If the wall is display:none (mobile breakpoint), skip — the visible
      // list rendering doesn't need lines drawn.
      if (wRect.width === 0 || wRect.height === 0) return;
      const sx = ((sRect.left + sRect.width / 2) - wRect.left) / wRect.width * 1000;
      const sy = ((sRect.top + sRect.height / 2) - wRect.top) / wRect.height * 520;

      const chitEls = wall.querySelectorAll<HTMLElement>("[data-chit]");
      const next: Line[] = [];
      chitEls.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const cx = ((r.left + r.width / 2) - wRect.left) / wRect.width * 1000;
        const cy = ((r.top + r.height / 2) - wRect.top) / wRect.height * 520;
        next.push({
          x1: cx, y1: cy, x2: sx, y2: sy,
          miss: DISAGREEMENT.has(i),
          delay: 0.3 + i * 0.08,
        });
      });
      setLines(next);
    }

    const t = setTimeout(drawLines, 100);
    window.addEventListener("resize", drawLines);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", drawLines);
    };
  }, []);

  return (
    <>
      {/* Mobile: accessible linear list. The wall below is visual flourish. */}
      <div className="sm:hidden">
        <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper">
          <div className="mb-4 text-center">
            <div
              className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full bg-ink font-display text-[32px] font-[360] italic text-paper"
              style={{ boxShadow: "0 0 0 5px #ebe4d4, 0 0 0 6px #c9bfa5" }}
              aria-hidden="true"
            >
              sk
            </div>
            <div className="mt-3 font-display text-[20px] font-[380]">
              Stephen King
            </div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
              b. 1947 · Portland, ME
            </div>
          </div>
          <ul
            className="m-0 list-none space-y-2 p-0"
            aria-label="Identifiers that reference Stephen King across national authorities"
          >
            {CHITS.map((c, i) => {
              const isDisagree = DISAGREEMENT.has(i);
              return (
                <li
                  key={i}
                  className={
                    "flex items-baseline justify-between gap-3 rounded-[2px] border border-paper-edge bg-paper px-3 py-2 " +
                    (isDisagree ? "border-l-2 border-l-oxblood" : "")
                  }
                >
                  <span className="font-mono text-[9px] font-medium uppercase tracking-eyebrow text-oxblood">
                    {c.scheme}
                    {isDisagree && (
                      <span className="sr-only"> (disagreement)</span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-ink break-all text-right">
                    {c.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Desktop: the wall flourish */}
      <div
        ref={wallRef}
        role="img"
        aria-label="A visual wall of identifier scraps surrounding the name Stephen King, with thin dashed lines drawn from each scrap to the center. Two of the lines are rendered in red to indicate disagreement between catalogs."
        className="relative hidden h-[520px] overflow-hidden rounded-[2px] border border-paper-edge bg-paper-deep shadow-paper sm:block"
      >
      {/* graph paper grid */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,118,42,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168,118,42,.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* connecting lines */}
      <svg
        className="pointer-events-none absolute inset-0 z-[2]"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        aria-hidden
      >
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.miss ? "#6e1f1f" : "#6a6a78"}
            strokeWidth={l.miss ? 0.8 : 0.5}
            strokeDasharray={l.miss ? "4 3" : "2 4"}
            style={{
              opacity: 0,
              animation: `lineFadeIn 1.4s ease-out forwards`,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </svg>

      {/* center: the named entity */}
      <div
        ref={specimenRef}
        className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <div
          className="relative mx-auto flex h-[110px] w-[110px] items-center justify-center rounded-full bg-ink font-display text-[38px] font-[360] italic text-paper"
          style={{
            boxShadow:
              "0 0 0 6px #ebe4d4, 0 0 0 7px #c9bfa5, 0 8px 24px -8px rgba(0,0,0,.4)",
          }}
        >
          sk
          <div
            aria-hidden
            className="absolute -inset-[18px] animate-spin-60s rounded-full border border-dashed border-oxblood opacity-35"
          />
        </div>
        <div className="mt-3.5 font-display text-[22px] font-[380] tracking-[-0.01em]">
          Stephen King
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          b. 1947 · Portland, ME
        </div>
      </div>

      {/* identifier chits */}
      {CHITS.map((c, i) => (
        <div
          key={i}
          data-chit
          className="absolute z-[3] rounded-[2px] border border-paper-edge bg-paper px-3 py-2 font-mono text-[11px] leading-[1.3] shadow-[0_4px_12px_-6px_rgba(0,0,0,.15)]"
          style={{
            left: c.left,
            top: c.top,
            transform: `rotate(${c.rot})`,
            opacity: 0,
            animation: "chitFadeIn 1s cubic-bezier(.2,.7,.2,1) forwards",
            animationDelay: `${c.delay}s`,
          }}
        >
          <span className="block text-[9px] font-medium uppercase tracking-eyebrow text-oxblood mb-0.5">
            {c.scheme}
          </span>
          <span className="text-ink">{c.value}</span>
        </div>
      ))}

      {/* keyframes — local to this component */}
      <style jsx>{`
        @keyframes lineFadeIn { to { opacity: .55; } }
        @keyframes chitFadeIn {
          from { opacity: 0; transform: scale(.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      </div>
    </>
  );
}
