import type { Metadata } from "next";
import {
  StagePage,
  Exhibit,
  ContinueCallout,
  HonestCapability,
} from "@/components/shared/stage-page";
import { AutoSuggest } from "@/components/stage2/autosuggest";
import { VoteReveal } from "@/components/stage2/vote-reveal";
import { DisagreementTypes } from "@/components/stage2/disagreement-types";
import { listDisambiguationCases } from "@/lib/disambiguation-cases";

export const metadata: Metadata = {
  title: "Distinguish",
  description:
    "Stage 2 of the Authority Arc — when two records look alike, decide whether they describe the same person. When they look different, decide whether they still might. Taught with live VIAF AutoSuggest and two curated cases.",
};

export default function DisambiguatePage() {
  const cases = listDisambiguationCases();
  return (
    <StagePage
      num="02"
      word="Two"
      title="Distinguish"
      headline={
        <>
          Which <em className="italic text-oxblood">Stephen King</em>?
        </>
      }
      aside={
        <>
          Identity is what survives <em className="italic">when the name no longer carries it</em>. The work is older than the web.
        </>
      }
      intro={
        <>
          Stage 1 took an identifier and told you what it pointed at. Stage 2
          starts where two strings refuse to settle. Authority records
          disagree.{" "}
          <em className="italic text-ink">
            Sometimes two records describe one person and the catalog has to
            merge them. Sometimes one name spans two people and the catalog
            has to keep them apart.
          </em>{" "}
          Either way, the discipline that decides is the older institutional
          cousin of the identity-resolution work modern systems quietly
          reinvent from scratch.
        </>
      }
      prev={{ slug: "identify", num: "01", title: "Identify" }}
      next={{ slug: "classify", num: "03", title: "Classify" }}
      continueCallout={
        <ContinueCallout
          slug="classify"
          num="03"
          word="Three"
          title="Classify"
          hook={
            <em className="italic text-oxblood">
              where does it sit in human knowledge?
            </em>
          }
          body={
            <>
              You have a cluster. Now: where in the structure of human
              knowledge does it belong? Stage 3 sets two answers next to
              each other — Dewey's hierarchical number, FAST's faceted
              intersection — and shows what each model can see that the
              other can't.
            </>
          }
        />
      }
    >
      {/* ─── EXHIBIT A: AUTOSUGGEST ─────────────────────────────── */}
      <Exhibit
        label="Exhibit A"
        heading={
          <>
            Watch the candidates appear —{" "}
            <em className="italic text-oxblood">live, ranked, named</em>
          </>
        }
        intro={
          <>
            Type any name. The request goes straight to VIAF's AutoSuggest
            endpoint, which returns the clusters it has on hand that prefix-
            match your query — ranked by VIAF's own scoring against the
            indexed name forms across forty-plus national authorities. Each
            row is a candidate identity. You haven't decided anything yet —
            you have only seen what the catalog could plausibly mean.
          </>
        }
        caption={
          <>
            Each row is a separate authority cluster. The work of Stage 2 is
            deciding which of them <strong className="not-italic text-oxblood">should</strong> still be separate.
          </>
        }
      >
        <AutoSuggest />
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[#b8d4a8]" />
          <span>Live · VIAF AutoSuggest API</span>
        </p>
      </Exhibit>

      {/* ─── EXHIBIT B: VOTE THEN REVEAL ────────────────────────── */}
      <Exhibit
        label="Exhibit B"
        heading={
          <>
            Two records.{" "}
            <em className="italic text-oxblood">Same person, or two?</em>
          </>
        }
        intro={
          <>
            Two curated cases — one pseudonym, one same-name. For each, you
            see two authority records as a cataloger would: heading, dates,
            field, known works. Commit to an answer before reading the
            reveal; the lesson sticks only if you have already chosen.
          </>
        }
      >
        <VoteReveal cases={cases} />
        <p className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ochre" />
          <span>Curated — record data and evidence summarized from real LC + VIAF entries</span>
        </p>
      </Exhibit>

      {/* ─── FIELD GUIDE: KINDS OF DISAGREEMENT ─────────────────── */}
      <DisagreementTypes />

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-7">
        <HonestCapability
          demonstrated={[
            "Live VIAF AutoSuggest queries with debounced typeahead, ARIA combobox semantics, and keyboard navigation.",
            "Two curated cases — Twain/Clemens (merge) and two different John Smiths (split) — with the actual evidence catalogers would cite.",
            "Vote-then-reveal interaction that requires the visitor to commit to an answer before the reveal renders.",
            "An editorial field guide naming the recurring shapes of disagreement: pseudonym link, transliteration variant, contested dates, posthumous merge/split, anonymous attribution.",
          ]}
          aspirational={[
            "That every case shown here has a single correct answer. In practice, many clusters carry an acknowledged probability of being wrong; VIAF documents the residual disagreement rather than pretending it resolved.",
            "That AutoSuggest's ranking reflects truth. It reflects VIAF's confidence against indexed name forms — which is a function of how many authorities have already crosswalked a cluster, not whether the cluster is correct.",
            "That the field guide is exhaustive. It is a starting taxonomy; real catalogs carry edge cases (composite identities, institutional pseudonyms, attributed-pseudonymous works) that don't fit any of these.",
          ]}
          faked={[
            "The two curated cases use illustrative record IDs and a summarized evidence list, not raw MARC dumps. The decisions and life-date data are accurate to the real records; the rendering is a museum placard, not a cataloger's worksheet.",
            "The 'painter John Smith' record (n79139831) is representative rather than a specific historical figure — there are several 19th-century painters named John Smith in LC; this card is composited from the demographic shape they share.",
            "Real LC authority records do not include a 'Field' line as such; that label is condensed from the 670-source citations and 678-biographical/historical notes for legibility.",
          ]}
        />
      </section>

      {/* ─── ESSAY ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-5 pb-32 sm:px-7">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
          A note from the curator
        </div>
        <h2 className="m-0 mb-9 font-display text-[clamp(34px,5vw,56px)] font-[360] leading-[1.02] tracking-[-0.02em]">
          The work is{" "}
          <em className="italic text-oxblood">a kept promise</em>, not a clean answer.
        </h2>

        <p className="font-display text-[19px] font-[320] leading-[1.65] text-ink first-line:tracking-wide">
          <span className="float-left mr-2.5 pt-1 font-display text-[4.4em] font-[380] leading-[.85] text-oxblood">
            T
          </span>
          he uncomfortable truth about authority work is that most of it ends in{" "}
          <em className="italic text-ink-soft">probable, not certain</em>. A
          catalog of fifty million names cannot afford to suspend belief on
          every disputed case forever. So the discipline does the thing every
          serious identity system eventually does: it makes a decision, names
          the evidence, and leaves a door open.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The door is the 4XX and 5XX fields in the MARC authority record —
          the see-from and see-also references — and the linked-data
          equivalents in modern formats. They say:{" "}
          <em className="italic text-ink-soft">
            we have decided these two names point at the same person, and
            here is the evidence; if you find a reason to think otherwise,
            here is where to write your objection.
          </em>{" "}
          The decision is provisional in the sense that any institution is
          provisional. Tomorrow's evidence can change today's cluster.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          This is also why VIAF does not call itself{" "}
          <em className="italic text-ink-soft">the</em> authority. It is a
          consensus layer over forty-plus national authorities, each of which
          is itself a kept promise from a specific institution to the rest of
          the bibliographic universe. When two authorities disagree about
          whether two name forms point at one person, VIAF preserves the
          disagreement and ships both interpretations until somebody does the
          archival work to resolve it.
        </p>

        <hr className="my-10 border-none text-center text-ochre-deep before:tracking-[1em] before:content-['✦__✦__✦']" />

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The next room is harder still. Once you have decided{" "}
          <em className="italic text-ink-soft">who</em> a record is about, you
          still have to say <em className="italic text-ink-soft">what</em> it
          is about — where in the structure of human knowledge it sits. There
          are two competing answers to that question, and they are not just
          formats. They are different epistemologies. Stage 3 puts them next
          to each other.
        </p>
      </section>
    </StagePage>
  );
}
