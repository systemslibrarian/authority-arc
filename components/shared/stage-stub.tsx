import Link from "next/link";

interface StageStubProps {
  num: string;
  title: string;
  subtitle: React.ReactNode;
  description: string;
  whatWeWillBuild: string[];
  prev?: { slug: string; num: string; title: string };
  next?: { slug: string; num: string; title: string };
}

/**
 * Stages 2–5 ship as labeled placeholders. The chrome (strip nav, eyebrow,
 * hero, "what we will build") is intentionally the same as a finished stage
 * so the arc reads as continuous from day one.
 *
 * Each placeholder explicitly says it is one. We don't pretend.
 */
export function StageStub({
  num,
  title,
  subtitle,
  description,
  whatWeWillBuild,
  prev,
  next,
}: StageStubProps) {
  return (
    <main>
      <section className="relative mx-auto max-w-[1100px] px-7 pb-16 pt-[90px]">
        <p className="font-mono text-[12px] uppercase tracking-eyebrow text-oxblood">
          <span className="text-ink-faint">§ {num} — </span>Stage{" "}
          {numToWord(num)} · {title}
        </p>

        <h1 className="mt-7 font-display text-[clamp(48px,7.5vw,92px)] font-[360] leading-[.96] tracking-[-0.025em]">
          {subtitle}
        </h1>

        <p className="mt-7 max-w-[680px] font-display text-[clamp(19px,2.1vw,24px)] font-[320] leading-[1.5] text-ink-soft">
          {description}
        </p>

        <div className="mt-12 inline-block rounded-[2px] border border-ochre/40 bg-paper-deep px-6 py-4">
          <p className="m-0 font-mono text-[11px] uppercase tracking-eyebrow text-ochre">
            In preparation
          </p>
          <p className="m-0 mt-1 font-display text-[15px] italic text-ink-soft">
            This stage exists in outline. The interactive is being built.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-7 pb-20">
        <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre">
            Outline
          </span>
          <h2 className="m-0 flex-1 font-display text-[24px] font-[380] tracking-[-0.01em]">
            What this room will hold.
          </h2>
        </div>
        <ul className="m-0 max-w-[760px] list-none space-y-4 p-0">
          {whatWeWillBuild.map((bullet, i) => (
            <li
              key={i}
              className="grid grid-cols-[40px_1fr] gap-4 font-display text-[17px] font-[320] leading-[1.6] text-ink"
            >
              <span className="font-mono text-[12px] text-oxblood">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-rule bg-paper-deep py-7">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-7 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          <div>
            {prev ? (
              <Link
                href={`/${prev.slug}`}
                className="text-oxblood transition-colors hover:text-oxblood-deep"
              >
                ← Previous: Stage {prev.num} — {prev.title}
              </Link>
            ) : (
              <span>The Authority Arc · A systemslibrarian project</span>
            )}
          </div>
          {next && (
            <Link
              href={`/${next.slug}`}
              className="text-oxblood transition-colors hover:text-oxblood-deep"
            >
              Next: Stage {next.num} — {next.title} →
            </Link>
          )}
        </div>
      </footer>
    </main>
  );
}

function numToWord(n: string): string {
  return ({ "01": "One", "02": "Two", "03": "Three", "04": "Four", "05": "Five" } as Record<string, string>)[n] ?? n;
}
