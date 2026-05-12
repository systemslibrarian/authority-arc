import Link from "next/link";

const STAGES = [
  {
    num: "01",
    slug: "identify",
    title: "Identify",
    pitch: "What is this thing, really?",
    blurb:
      "Every digital object carries a fistful of identifiers — ISBN, OCLC number, LCCN, VIAF cluster, DOI, Wikidata Q-number. They all claim to point at the same thing. The work of deciding is older than the web.",
    state: "live" as const,
  },
  {
    num: "02",
    slug: "disambiguate",
    title: "Disambiguate",
    pitch: "Which Stephen King?",
    blurb:
      "There are hundreds of Stephen Kings in the world's catalogs. The discipline that resolves them — cluster by cluster, evidence by evidence — is what every identity-resolution system reinvents from scratch.",
    state: "coming-soon" as const,
  },
  {
    num: "03",
    slug: "classify",
    title: "Classify",
    pitch: "Where does it sit in human knowledge?",
    blurb:
      "Dewey is hierarchical — a book belongs at one number. FAST is faceted — one book gets many headings that intersect. The difference between a tree and a graph, taught with real records.",
    state: "coming-soon" as const,
  },
  {
    num: "04",
    slug: "connect",
    title: "Connect",
    pitch: "What does it touch?",
    blurb:
      "Authority data is a knowledge graph. Walk outward from an entity — works by, works about, influences, contemporaries, subjects in common — and watch the structure of human knowledge render itself.",
    state: "coming-soon" as const,
  },
  {
    num: "05",
    slug: "maintain",
    title: "Maintain",
    pitch: "Identity as stewardship.",
    blurb:
      "Names change. Records get corrected. Entities get merged and split. Cataloging is not clerical work; it is the ongoing care of identity, meaning, relationships, and trust. The stage where fingerprints become signatures, and stewardship becomes verifiable.",
    state: "coming-soon" as const,
  },
];

export default function Landing() {
  return (
    <main className="mx-auto max-w-[1100px] px-7 pb-32 pt-[90px]">
      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <p className="font-mono text-[12px] uppercase tracking-eyebrow text-oxblood">
        <span className="text-ink-faint">A five-stage arc · </span>
        Introduction
      </p>
      <h1 className="mt-7 max-w-[920px] font-display text-[clamp(48px,7.5vw,92px)] font-[360] leading-[.96] tracking-[-0.025em]">
        How librarians solved <em className="italic text-oxblood">identity</em>,
        decades before Big Tech tried.
      </h1>
      <p className="mt-7 max-w-[680px] font-display text-[clamp(19px,2.1vw,24px)] font-[320] leading-[1.5] text-ink-soft">
        Every digital object has many names. The work of keeping those names in
        agreement — of deciding when two strings refer to the same thing and
        when they do not — is one of the foundational hard problems in
        computing. Catalogers and reference librarians have been doing it,
        publicly and at scale, since the nineteen-sixties.{" "}
        <em className="italic text-ink">
          This is a walking tour of how.
        </em>
      </p>

      {/* ─── SCRIPTURE EPIGRAPH ─────────────────────────────────────── */}
      <figure className="mt-16 max-w-[680px] border-l-2 border-oxblood pl-6">
        <blockquote className="font-display text-[19px] font-[320] italic leading-[1.55] text-ink">
          He determines the number of the stars; he gives to all of them their
          names.
        </blockquote>
        <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-eyebrow text-ink-faint">
          — Psalm 147:4 (ESV)
        </figcaption>
      </figure>

      {/* ─── THE FIVE STAGES ────────────────────────────────────────── */}
      <section className="mt-24">
        <div className="mb-3 max-w-[760px]">
          <p className="font-display text-[19px] font-[320] italic leading-[1.55] text-ink-soft">
            Learn how libraries know what things are. The arc moves from{" "}
            <em className="italic text-ink">"Who is this?"</em> to{" "}
            <em className="italic text-ink">
              "How does the knowledge graph know?"
            </em>{" "}
            — and ends with the older, harder question of how that knowing is
            kept true over time.
          </p>
        </div>
        <div className="mb-10 flex items-baseline gap-6 border-b border-rule pb-4">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre">
            The Five Rooms
          </span>
          <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
            Each stage builds on the one before it.
          </h2>
        </div>

        <ol className="space-y-12">
          {STAGES.map((stage) => (
            <li key={stage.slug} className="grid grid-cols-[80px_1fr] gap-8">
              <div>
                <div className="font-mono text-[40px] font-[320] leading-none text-oxblood">
                  {stage.num}
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <h3 className="m-0 font-display text-[26px] font-[380] tracking-[-0.01em]">
                    {stage.state === "live" ? (
                      <Link
                        href={`/${stage.slug}`}
                        className="transition-colors hover:text-oxblood"
                      >
                        {stage.title}
                      </Link>
                    ) : (
                      <span className="text-ink-faint">{stage.title}</span>
                    )}
                  </h3>
                  {stage.state === "coming-soon" && (
                    <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
                      ─ in preparation
                    </span>
                  )}
                </div>
                <p className="mt-1 font-display text-[18px] italic text-ink-soft">
                  {stage.pitch}
                </p>
                <p className="mt-4 max-w-[640px] font-display text-[17px] font-[320] leading-[1.6] text-ink">
                  {stage.blurb}
                </p>
                {stage.state === "live" && (
                  <Link
                    href={`/${stage.slug}`}
                    className="mt-5 inline-block font-mono text-[11px] uppercase tracking-eyebrow text-oxblood transition-colors hover:text-oxblood-deep"
                  >
                    Enter the room →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── FOOTER NOTE ────────────────────────────────────────────── */}
      <section className="mt-32 max-w-[680px] border-t border-rule pt-10">
        <p className="font-display text-[15.5px] italic leading-[1.65] text-ink-soft">
          The Authority Arc is built by{" "}
          <a
            href="https://systemslibrarian.dev"
            className="text-oxblood underline-offset-2 hover:underline"
          >
            Paul Clark
          </a>{" "}
          using the public APIs of the Virtual International Authority File
          (VIAF) and — where access permits — OCLC's WorldCat Entities API.
          VIAF data is provided under the Open Data Commons Attribution
          License (ODC-BY). This site claims no affiliation with OCLC.
        </p>
      </section>
    </main>
  );
}
