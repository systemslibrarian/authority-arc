import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Stage page chrome — the museum scaffolding every stage shares so they
 * read as parts of one coherent arc. Children are the body content
 * (exhibits, essays, custom sections) which sit between the hero and
 * the standard footer.
 *
 * Each stage gets its own page.tsx that supplies the editorial copy
 * via props; the chrome stays identical so the visitor's sense of
 * place (eyebrow + hero + section pattern + footer) carries across
 * the arc.
 */

interface StageNeighbor {
  num: string;
  slug: string;
  title: string;
}

interface StagePageProps {
  num: "01" | "02" | "03" | "04" | "05";
  /** Section title, e.g. "Disambiguate". */
  title: string;
  /** Word equivalent for the stage number, e.g. "Two". */
  word: "One" | "Two" | "Three" | "Four" | "Five";
  /** Headline as a JSX node so emphasis can be styled inline. */
  headline: ReactNode;
  /** Hero blurb under the headline. */
  intro: ReactNode;
  /** Optional aside that floats in the top-right of the hero. */
  aside?: ReactNode;
  /** Body content — Exhibit blocks, essays, anything stage-specific. */
  children: ReactNode;
  /** Previous stage for the footer back-link. Omit on Stage 1. */
  prev?: StageNeighbor;
  /** Next stage. Omit on Stage 5. */
  next?: StageNeighbor;
  /** Optional continue-callout content above the footer. Pass null/undefined for none. */
  continueCallout?: ReactNode;
}

export function StagePage({
  num,
  title,
  word,
  headline,
  intro,
  aside,
  children,
  prev,
  next,
  continueCallout,
}: StagePageProps) {
  return (
    <main id="main-content">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-[90px]">
        {aside && (
          <div className="absolute right-7 top-[110px] hidden w-[200px] border-l-2 border-oxblood pl-3.5 font-mono text-[10.5px] leading-[1.7] tracking-[.04em] text-ink-faint md:block">
            {aside}
          </div>
        )}

        <p className="font-mono text-[12px] uppercase tracking-eyebrow text-oxblood">
          <span className="text-ink-faint">§ {num} of 05 — </span>Stage {word}{" "}
          · {title}
        </p>

        <h1 className="mt-7 font-display text-[clamp(48px,7.5vw,92px)] font-[360] leading-[.96] tracking-[-0.025em]">
          {headline}
        </h1>

        <p className="mt-7 max-w-[680px] font-display text-[clamp(19px,2.1vw,24px)] font-[320] leading-[1.5] text-ink-soft">
          {intro}
        </p>
      </section>

      {children}

      {continueCallout}

      {/* ─── TAIL ───────────────────────────────────────────────── */}
      <footer className="border-t border-rule bg-paper-deep py-7">
        <nav
          aria-label="Stage navigation"
          className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-3 px-5 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint sm:flex-row sm:items-center sm:px-7"
        >
          <div>
            {prev ? (
              <Link
                href={`/${prev.slug}`}
                className="rounded-[2px] text-oxblood transition-colors hover:text-oxblood-deep"
              >
                <span aria-hidden="true">← </span>
                Previous: Stage {prev.num} — {prev.title}
              </Link>
            ) : (
              <span>The Authority Arc · A systemslibrarian project</span>
            )}
          </div>
          {next && (
            <Link
              href={`/${next.slug}`}
              className="rounded-[2px] text-oxblood transition-colors hover:text-oxblood-deep"
            >
              Next: Stage {next.num} — {next.title}
              <span aria-hidden="true"> →</span>
            </Link>
          )}
        </nav>
      </footer>
    </main>
  );
}

// ─── Reusable subcomponents ────────────────────────────────────────────────

interface ExhibitProps {
  /** Eyebrow label, e.g. "Exhibit A". */
  label: string;
  /** Headline as JSX so emphasis can be styled. */
  heading: ReactNode;
  /** Intro paragraph above the interactive. */
  intro?: ReactNode;
  /** The interactive / visual itself. */
  children: ReactNode;
  /** Optional caption below the interactive. */
  caption?: ReactNode;
}

/**
 * An Exhibit block — the museum-placard pattern used to introduce each
 * interactive on a stage page. Stage 1 uses two of these (Exhibits A and B).
 */
export function Exhibit({ label, heading, intro, children, caption }: ExhibitProps) {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-7 sm:pb-20">
      <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
          {label}
        </span>
        <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
          {heading}
        </h2>
      </div>
      {intro && (
        <p className="mb-10 max-w-[720px] font-display text-[18px] font-[320] leading-[1.55] text-ink-soft">
          {intro}
        </p>
      )}
      {children}
      {caption && (
        <p className="mt-5 text-center font-display text-[17px] italic text-ink-soft">
          {caption}
        </p>
      )}
    </section>
  );
}

interface ContinueCalloutProps {
  /** Next stage slug, e.g. "disambiguate". */
  slug: string;
  /** Stage number string, e.g. "02". */
  num: string;
  /** Stage word, e.g. "Two". */
  word: string;
  /** Stage title, e.g. "Disambiguate". */
  title: string;
  /** Headline phrased as a question / hook. JSX so emphasis can be styled. */
  hook: ReactNode;
  /** Body copy — 1-3 sentences framing why to continue. */
  body: ReactNode;
}

/**
 * "Continue to next stage" placard. Sits above the footer on every stage
 * except the last one. The hook should reference what just happened on this
 * stage so the transition feels editorial, not navigational.
 */
export function ContinueCallout({
  slug,
  num,
  word,
  title,
  hook,
  body,
}: ContinueCalloutProps) {
  return (
    <section
      aria-label={`Continue to Stage ${num}`}
      className="mx-auto max-w-[720px] px-5 pb-24 sm:px-7"
    >
      <Link
        href={`/${slug}`}
        className="group block rounded-[2px] border border-rule bg-paper-deep p-6 shadow-paper transition-colors hover:border-oxblood sm:p-8"
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
            The next room
          </span>
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            § {num} of 05
          </span>
        </div>
        <h2 className="m-0 mt-3 font-display text-[clamp(26px,3.5vw,34px)] font-[380] leading-[1.1] tracking-[-0.015em] text-ink group-hover:text-oxblood">
          Stage {word} · {title} — {hook}
        </h2>
        <p className="mt-3 font-display text-[16px] font-[320] leading-[1.55] text-ink-soft">
          {body}
        </p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood transition-colors group-hover:text-oxblood-deep">
          Enter the room<span aria-hidden="true"> →</span>
        </p>
      </Link>
    </section>
  );
}

interface HonestCapabilityProps {
  /** Items shown to be reproducible from source. */
  demonstrated: string[];
  /** Lessons implied but not proven on the page. */
  aspirational: string[];
  /** Narrative liberties named honestly. */
  faked: string[];
}

/**
 * The Honest Capability section. Three-column accounting of what each stage
 * actually demonstrates vs. what it merely implies vs. what is narratively
 * convenient. A page with no FAKED column is dishonest; a page where
 * DEMONSTRATED is smaller than the claims is misleading.
 */
export function HonestCapability({
  demonstrated,
  aspirational,
  faked,
}: HonestCapabilityProps) {
  return (
    <section className="mt-24 border-t border-rule pt-12">
      <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
          Honest Capability
        </span>
        <h3 className="m-0 flex-1 font-display text-[24px] font-[380] tracking-[-0.01em]">
          What this page <em className="italic text-oxblood">actually</em>{" "}
          does, and what it doesn't.
        </h3>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <HonestColumn
          tone="green"
          label="Demonstrated"
          subtitle="Reproducible from the source code"
          items={demonstrated}
        />
        <HonestColumn
          tone="amber"
          label="Aspirational"
          subtitle="What the page implies but does not prove"
          items={aspirational}
        />
        <HonestColumn
          tone="red"
          label="Faked, with cause"
          subtitle="Narrative liberties, named honestly"
          items={faked}
        />
      </div>
    </section>
  );
}

function HonestColumn({
  tone,
  label,
  subtitle,
  items,
}: {
  tone: "green" | "amber" | "red";
  label: string;
  subtitle: string;
  items: string[];
}) {
  const bar = {
    green: "border-[#5a7a3a]",
    amber: "border-ochre",
    red: "border-oxblood",
  }[tone];
  return (
    <div className={`border-l-[3px] ${bar} pl-5`}>
      <div className="font-mono text-[10px] font-medium uppercase tracking-eyebrow text-ink-faint">
        {label}
      </div>
      <div className="mt-1 font-display text-[14px] italic text-ink-soft">
        {subtitle}
      </div>
      <ul className="mt-4 list-none space-y-3 p-0">
        {items.map((item, i) => (
          <li key={i} className="font-display text-[15px] leading-[1.55] text-ink">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
