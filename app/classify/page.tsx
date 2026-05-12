import type { Metadata } from "next";
import {
  StagePage,
  Exhibit,
  ContinueCallout,
  HonestCapability,
} from "@/components/shared/stage-page";
import { DeweyTree } from "@/components/stage3/dewey-tree";
import { FastFacets } from "@/components/stage3/fast-facets";
import { listClassifyRecords } from "@/lib/classify-records";

export const metadata: Metadata = {
  title: "Classify",
  description:
    "Stage 3 of the Authority Arc — one book, two answers. Dewey gives a single hierarchical number; FAST gives many faceted access points. Tree versus graph, taught with a real classified record.",
};

export default function ClassifyPage() {
  const record = listClassifyRecords()[0];
  return (
    <StagePage
      num="03"
      word="Three"
      title="Classify"
      headline={
        <>
          Where does it{" "}
          <em className="italic text-oxblood">sit</em> in human knowledge?
        </>
      }
      aside={
        <>
          Two schemes. One book.{" "}
          <em className="italic">Same shelf, different geography.</em>
        </>
      }
      intro={
        <>
          A cluster is named. A person is disambiguated. Now: where does the
          book they wrote sit?{" "}
          <em className="italic text-ink">
            Dewey gives one number. FAST gives many access points. The
            difference between them is the difference between a tree and a
            graph — between hierarchy and intersection — and it is one of the
            oldest live debates in cataloging.
          </em>{" "}
          This room sets them next to each other for the same book.
        </>
      }
      prev={{ slug: "disambiguate", num: "02", title: "Disambiguate" }}
      next={{ slug: "connect", num: "04", title: "Connect" }}
      continueCallout={
        <ContinueCallout
          slug="connect"
          num="04"
          word="Four"
          title="Connect"
          hook={
            <em className="italic text-oxblood">what does it touch?</em>
          }
          body={
            <>
              FAST already implied the answer: each facet is a path into a
              larger graph. Stage 4 walks that graph — works by, works about,
              influences, contemporaries, subjects in common — and asks what
              you can see only when identity is connected, not just named.
            </>
          }
        />
      }
    >
      {/* ─── BOOK CONTEXT ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-10 sm:px-7">
        <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
            The specimen
          </span>
          <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
            One book —{" "}
            <em className="italic text-oxblood">
              {record.work.title}, {record.work.publishedYear}
            </em>
          </h2>
        </div>
        <div className="rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-7">
          <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 font-mono text-[12.5px] sm:grid-cols-[140px_1fr]">
            <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
              Title
            </dt>
            <dd className="font-display text-[16px] text-ink">
              {record.work.title}
            </dd>
            <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
              Author
            </dt>
            <dd className="font-display text-[14px] text-ink">
              {record.work.author}
            </dd>
            <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
              Published
            </dt>
            <dd className="text-ink">
              {record.work.publishedYear} · {record.work.publisher}
            </dd>
            <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
              OCLC
            </dt>
            <dd className="text-ink">{record.work.oclc}</dd>
            <dt className="text-[10px] uppercase tracking-eyebrow text-ink-faint">
              ISBN
            </dt>
            <dd className="text-ink">{record.work.isbn}</dd>
          </dl>
        </div>
        <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ochre" />
          <span>Curated · Dewey + FAST data from real LC + OCLC records</span>
        </p>
      </section>

      {/* ─── EXHIBIT A: DEWEY TREE ──────────────────────────────── */}
      <Exhibit
        label="Exhibit A"
        heading={
          <>
            Dewey —{" "}
            <em className="italic text-oxblood">one number, one path</em>
          </>
        }
        intro={
          <>
            Dewey is a hierarchical scheme: every book belongs at exactly one
            number, and that number is the leaf of a single descending chain
            from <span className="font-mono">000</span> through narrower and
            narrower categories. Click each level to see what it does and why
            it is shaped the way it is — Dewey's idiosyncrasies are part of
            the lesson.
          </>
        }
      >
        <DeweyTree record={record} />
      </Exhibit>

      {/* ─── EXHIBIT B: FAST FACETS ────────────────────────────── */}
      <Exhibit
        label="Exhibit B"
        heading={
          <>
            FAST —{" "}
            <em className="italic text-oxblood">
              many headings, an intersection
            </em>
          </>
        }
        intro={
          <>
            FAST takes the opposite stance. The same book carries many
            independent access points across separate facets — topical,
            geographic, chronological, form. The book does not sit in any
            single place; it sits at the intersection of all of them. Click
            any heading to see what it tells the catalog.
          </>
        }
      >
        <FastFacets record={record} />
      </Exhibit>

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-7">
        <HonestCapability
          demonstrated={[
            "An interactive Dewey tree showing the actual hierarchical path from 800 → 813.54 for a real published book, with editorial notes on why each level exists.",
            "FAST headings grouped by facet (Topical, Geographic, Chronological, Form/Genre), each with a per-heading note on what that access point tells the catalog.",
            "Side-by-side framing that lets the visitor feel the difference between 'one number' and 'many headings' for the same work.",
          ]}
          aspirational={[
            "That Dewey and FAST are direct competitors. They are; but most large library catalogs run both simultaneously — Dewey for shelf order, FAST for subject access — and treat them as different tools for different jobs.",
            "That the Dewey path is the only possible classification for this book. A cataloger looking at King's *It* could legitimately have placed it at 813.6 (post-2000) or with an additional subject number; the chosen path is the most common one in WorldCat.",
            "That the FAST headings shown are exhaustive. Real WorldCat records for this title carry additional headings; we showed the most pedagogically clear six.",
          ]}
          faked={[
            "The Dewey editorial notes per level are written for legibility, not transcribed from the DDC tables. The numeric breakdown is accurate; the prose framing is ours.",
            "The 'siblings at this level' list is a representative subset, not an exhaustive enumeration of every Dewey number adjacent to 813.54.",
            "FAST IDs are illustrative formatting; some IDs in real FAST are longer or carry version suffixes. The point is the shape of the controlled vocabulary, not the exact identifier syntax.",
          ]}
        />
      </section>

      {/* ─── ESSAY ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-5 pb-32 sm:px-7">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
          A note from the curator
        </div>
        <h2 className="m-0 mb-9 font-display text-[clamp(34px,5vw,56px)] font-[360] leading-[1.02] tracking-[-0.02em]">
          Classification is{" "}
          <em className="italic text-oxblood">an epistemology</em>, dressed as a notation.
        </h2>

        <p className="font-display text-[19px] font-[320] leading-[1.65] text-ink first-line:tracking-wide">
          <span className="float-left mr-2.5 pt-1 font-display text-[4.4em] font-[380] leading-[.85] text-oxblood">
            T
          </span>
          he reason Dewey and FAST cannot be reconciled by a converter is
          that they disagree about what knowledge looks like. Dewey is a{" "}
          <em className="italic text-ink-soft">tree</em>: knowledge has a
          single root, descends into nine main classes, divides cleanly into
          ten subclasses each, and admits exactly one location per book. FAST
          is a <em className="italic text-ink-soft">graph</em>: a book is
          described by independent dimensions, and the dimensions intersect
          rather than nest.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The tree is older — Melvil Dewey published the first edition in
          1876, eight decades before the postcoordinate-indexing schemes that
          would eventually become FAST. The tree has the advantage of being{" "}
          <em className="italic text-ink-soft">walkable</em>: you can stand
          at any node and look up at the parent. The graph has the advantage
          of being <em className="italic text-ink-soft">queryable</em>: you
          can intersect facets and arrive at any book by any of its access
          points.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          Modern software-shaped intuition tends to pick FAST as the obvious
          winner. The graph is more flexible; the tree is brittle. But the
          tree is what makes a physical library navigable — it is what
          decides which book sits next to which other book on the shelf —
          and the act of having to choose one location is itself a forcing
          function on the cataloger's thinking. Forced single placement makes
          you decide, even when the work resists.
        </p>

        <hr className="my-10 border-none text-center text-ochre-deep before:tracking-[1em] before:content-['✦__✦__✦']" />

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          Once a work has been classified, it is locatable — by topic, by
          place, by genre, by anything else the cataloger has thought to
          name. But the catalog has not yet said what the work{" "}
          <em className="italic text-ink-soft">touches</em>. Stage 4 walks
          outward. From this one work to its author. From the author to her
          contemporaries. From the contemporaries to their shared subjects.
          The graph that FAST hinted at becomes the room you stand in.
        </p>
      </section>
    </StagePage>
  );
}
