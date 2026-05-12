import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { WallOfIdentifiers } from "@/components/stage1/wall-of-identifiers";
import { Resolver } from "@/components/stage1/resolver";
import { HonestCapability } from "@/components/stage1/honest-capability";
import { fixtureLookup } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Identify",
  description:
    "Stage 1 of the Authority Arc — resolve any persistent identifier against VIAF and watch the cluster of references appear. The work of deciding when two strings refer to the same thing is older than the web.",
};

// Seed the resolver with a real captured VIAF record so the page is never
// blank on first load. Provenance is reported honestly via the pill on the
// card — it shows "Fixture fallback" until the visitor clicks Resolve, at
// which point the same record refreshes against live VIAF.
const SEED = fixtureLookup({ curator: "LC", id: "n79018049" });

export default function IdentifyPage() {
  return (
    <main id="main-content">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-[90px]">
        <div className="absolute right-7 top-[110px] hidden w-[200px] border-l-2 border-oxblood pl-3.5 font-mono text-[10.5px] leading-[1.7] tracking-[.04em] text-ink-faint md:block">
          An identifier is not just a string. It is a string{" "}
          <em className="italic">and</em> a curator. The same string means
          different things to different keepers.
        </div>

        <p className="font-mono text-[12px] uppercase tracking-eyebrow text-oxblood">
          <span className="text-ink-faint">§ 01 of 05 — </span>Stage One · Identify
        </p>

        <h1 className="mt-7 font-display text-[clamp(48px,7.5vw,92px)] font-[360] leading-[.96] tracking-[-0.025em]">
          What is this <em className="italic text-oxblood">thing</em>, really?
        </h1>

        <p className="mt-7 max-w-[680px] font-display text-[clamp(19px,2.1vw,24px)] font-[320] leading-[1.5] text-ink-soft">
          Every digital object in a library carries a fistful of identifiers —
          an ISBN, an OCLC number, an LCCN, a VIAF cluster, a DOI, a Wikidata
          Q-number, a local catalog ID. They all claim to point at the same
          thing.{" "}
          <em className="italic text-ink">
            Most of the time, they do. Sometimes they don't. And the work of
            deciding is older than the web.
          </em>
        </p>
      </section>

      {/* ─── EXHIBIT A: THE WALL ─────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-7 sm:pb-20">
        <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
            Exhibit A
          </span>
          <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
            A single author,{" "}
            <em className="italic text-oxblood">
              and the cloud of names that points at him
            </em>
          </h2>
        </div>
        <p className="mb-10 max-w-[720px] font-display text-[18px] font-[320] leading-[1.55] text-ink-soft">
          Stephen King has lived in catalogs for sixty years. Twenty-plus
          national authorities maintain a record for him. Each one assigns its
          own identifier — its own spelling, its own dates, its own MARC
          encoding of "this is the same person." VIAF and OCLC's WorldCat
          Entities API try to keep them in agreement.
        </p>

        <WallOfIdentifiers />

        <p className="mt-5 text-center font-display text-[17px] italic text-ink-soft">
          All of these point to{" "}
          <strong className="font-normal not-italic text-oxblood">
            one person
          </strong>{" "}
          — or are supposed to. The dashes are{" "}
          <strong className="font-normal not-italic text-oxblood">
            agreement
          </strong>
          . The red lines are where someone disagrees.
        </p>
      </section>

      {/* ─── EXHIBIT B: RESOLVER ────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-7 sm:pb-20">
        <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
            Exhibit B
          </span>
          <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
            Resolve any identifier —{" "}
            <em className="italic text-oxblood">watch the others appear</em>
          </h2>
        </div>
        <p className="mb-10 max-w-[720px] font-display text-[18px] font-[320] leading-[1.55] text-ink-soft">
          Paste an identifier from any curator below. The request goes to VIAF,
          which returns the cluster URI, the preferred heading, and every other
          identifier VIAF knows about for the same entity. When OCLC's PID
          Lookup API is provisioned, this same form will additionally return
          the canonical WorldCat Entity URI and an MD5 content fingerprint.
        </p>

        <Suspense fallback={null}>
          <Resolver initial={SEED ?? undefined} />
        </Suspense>
      </section>

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 sm:px-7 pb-24">
        <HonestCapability />
      </section>

      {/* ─── ESSAY ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-7 pb-32">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
          A note from the curator
        </div>
        <h2 className="m-0 mb-9 font-display text-[clamp(34px,5vw,56px)] font-[360] leading-[1.02] tracking-[-0.02em]">
          An identifier is{" "}
          <em className="italic text-oxblood">a contract</em>.
        </h2>

        <p className="font-display text-[19px] font-[320] leading-[1.65] text-ink first-line:tracking-wide">
          <span className="float-left mr-2.5 pt-1 font-display text-[4.4em] font-[380] leading-[.85] text-oxblood">
            T
          </span>
          he word <em className="italic text-ink-soft">identifier</em> sounds
          passive — a label, a tag, a barcode — but every identifier in a
          library is the visible end of a promise. Somebody, somewhere, has
          agreed to keep resolving it. Without that promise, the string is
          decoration.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The Library of Congress promises to keep{" "}
          <code className="font-mono text-[0.85em]">n79018049</code> pointing
          at Stephen King. The Bibliothèque nationale de France makes the same
          promise about <code className="font-mono text-[0.85em]">cb11909418n</code>. VIAF promises to keep its
          cluster URI alive, and — here is the deeper promise — to maintain
          the <em className="italic text-ink-soft">mapping</em> between all of
          those national promises. When LC corrects a typo, VIAF notices. When
          a pseudonym is finally linked to the author behind it, VIAF reflects
          that. None of this is automatic. It is institutional labor performed
          for decades, mostly invisibly, by people whose job titles do not say{" "}
          <em className="italic text-ink-soft">"persistent identifier engineer."</em>
        </p>

        <hr className="my-10 border-none text-center text-ochre-deep before:tracking-[1em] before:content-['✦__✦__✦']" />

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          Stage 1 was the easy part: you point at a thing and the system points
          back. Stage 2 is harder.{" "}
          <em className="italic text-ink-soft">Which</em> Stephen King? There is
          more than one, in the wider catalog. There are more than one of
          nearly everyone. The discipline that resolves them — cluster by
          cluster, evidence by evidence — is the next room of the museum.
        </p>
      </section>

      {/* ─── CONTINUE TO STAGE 2 ───────────────────────────────── */}
      <section
        aria-label="Continue to Stage 2"
        className="mx-auto max-w-[720px] px-5 pb-24 sm:px-7"
      >
        <Link
          href="/disambiguate"
          className="group block rounded-[2px] border border-rule bg-paper-deep p-6 shadow-paper transition-colors hover:border-oxblood sm:p-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ochre-deep">
              The next room
            </span>
            <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
              § 02 of 05
            </span>
          </div>
          <h2 className="m-0 mt-3 font-display text-[clamp(26px,3.5vw,34px)] font-[380] leading-[1.1] tracking-[-0.015em] text-ink group-hover:text-oxblood">
            Stage Two · Disambiguate —{" "}
            <em className="italic text-oxblood">which Stephen King?</em>
          </h2>
          <p className="mt-3 font-display text-[16px] font-[320] leading-[1.55] text-ink-soft">
            You just watched one identifier expand into twenty. Stage 2 starts
            with the opposite problem: twenty <em>candidates</em> for one
            person, and the discipline that decides — cluster by cluster,
            evidence by evidence — which of them is really the same.
          </p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood transition-colors group-hover:text-oxblood-deep">
            Enter the room<span aria-hidden="true"> →</span>
          </p>
        </Link>
      </section>

      {/* ─── TAIL ───────────────────────────────────────────────── */}
      <footer className="border-t border-rule bg-paper-deep py-7">
        <nav
          aria-label="Stage navigation"
          className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-3 px-5 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint sm:flex-row sm:items-center sm:px-7"
        >
          <div>The Authority Arc · A systemslibrarian project</div>
          <Link
            href="/disambiguate"
            className="rounded-[2px] text-oxblood transition-colors hover:text-oxblood-deep"
          >
            Next: Stage 02 — Disambiguate<span aria-hidden="true"> →</span>
          </Link>
        </nav>
      </footer>
    </main>
  );
}
