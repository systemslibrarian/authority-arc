"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STAGES = [
  { num: "01", slug: "identify",     label: "Identify" },
  { num: "02", slug: "disambiguate", label: "Disambiguate" },
  { num: "03", slug: "classify",     label: "Classify" },
  { num: "04", slug: "connect",      label: "Connect" },
  { num: "05", slug: "maintain",     label: "Maintain" },
] as const;

/**
 * The strip nav — a single horizontal band across the top of every page.
 *
 * Visual goals:
 *  - Looks like a museum gallery sign, not a SaaS navbar.
 *  - Always shows the full arc so visitors see where they are in the sequence.
 *  - On mobile it scrolls horizontally rather than collapsing into a burger menu.
 *    The five-stage sequence is the product; a hamburger menu would hide it.
 */
export function StripNav() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="border-b border-rule bg-paper py-[18px]">
      <div className="mx-auto flex max-w-[1100px] items-baseline justify-between gap-8 px-7">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-strip text-oxblood transition-colors hover:text-oxblood-deep"
        >
          The Authority Arc
        </Link>

        <nav
          aria-label="Arc stages"
          className="no-scrollbar flex gap-[18px] overflow-x-auto font-mono text-[11px] uppercase tracking-strip text-ink-faint"
        >
          {STAGES.map((stage) => {
            const href = `/${stage.slug}`;
            const isCurrent = pathname === href;
            return (
              <Link
                key={stage.slug}
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "border-b border-ink pb-[2px] text-ink"
                    : "opacity-35 hover:opacity-100 hover:text-ink"
                }
              >
                {stage.num} {stage.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="https://systemslibrarian.dev"
          className="font-mono text-[11px] uppercase tracking-strip text-ink-faint transition-colors hover:text-ink"
        >
          systemslibrarian.dev
        </a>
      </div>
    </header>
  );
}
