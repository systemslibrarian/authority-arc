import type { Metadata } from "next";
import {
  StagePage,
  Exhibit,
  HonestCapability,
} from "@/components/shared/stage-page";
import { Ledger } from "@/components/stage5/ledger";
import { listMaintainRecords, merkleizeRecord } from "@/lib/maintain-records";

export const metadata: Metadata = {
  title: "Maintain",
  description:
    "Stage 5 of the Authority Arc — identity is not a snapshot, it is a stream. A working ledger of catalog changes for one entity, and the harder question of what a verifiable trust layer over institutional stewardship would actually require.",
};

export default function MaintainPage() {
  const record = listMaintainRecords()[0];
  // Build a Merkle tree over the ledger at render time — Stage 5's
  // working demonstration of the trust-layer proposal.
  const merkleized = merkleizeRecord(record);
  return (
    <StagePage
      num="05"
      word="Five"
      title="Maintain"
      headline={
        <>
          Identity as{" "}
          <em className="italic text-oxblood">stewardship</em>.
        </>
      }
      aside={
        <>
          The identifier is the visible end of a promise.{" "}
          <em className="italic">Stewardship is the promise being kept.</em>
        </>
      }
      intro={
        <>
          The four rooms before this taught how an identity is named,
          told apart from its namesakes, classified, and connected.{" "}
          <em className="italic text-ink">
            This room is about what happens after — for decades — to keep
            that identity true.
          </em>{" "}
          Names change. Records get corrected. Entities get merged, split,
          transliterated, and re-transliterated. Cataloging is not clerical
          work; it is the ongoing care of identity, meaning, relationships,
          and trust. Stage 5 walks one record's ledger of changes, then
          asks the harder question: what would it take to verify all this
          against something stronger than institutional reputation?
        </>
      }
      prev={{ slug: "connect", num: "04", title: "Connect" }}
    >
      {/* ─── EXHIBIT A: STEWARDSHIP LEDGER ──────────────────────── */}
      <Exhibit
        label="Exhibit A"
        heading={
          <>
            One identity, forty-five years of{" "}
            <em className="italic text-oxblood">kept promises</em>
          </>
        }
        intro={
          <>
            Each entry below is a real type of change a real authority record
            undergoes over its lifetime. The dates are anchored to public
            events where they are documented and are representative
            otherwise — what matters here is the <em>shape</em> of the
            stewardship work: who acts, what gets recorded, and why each
            kind of edit matters. Click any row to read the editorial note.
          </>
        }
      >
        <Ledger record={merkleized} />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ochre" />
            <span>Curated · entries are real change-types; specific dates are anchored where public and representative otherwise</span>
          </p>
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[#5a7a3a]" />
            <span>Live · Merkle root computed at build, verified in browser via SubtleCrypto</span>
          </p>
        </div>
        <p className="mt-6 max-w-[760px] border-l-[3px] border-paper-edge pl-5 font-display text-[15.5px] italic leading-[1.6] text-ink-soft">
          {record.stewardshipNote}
        </p>
      </Exhibit>

      {/* ─── THE TRUST QUESTION ─────────────────────────────────── */}
      <section
        aria-label="The trust question"
        className="mx-auto max-w-[1100px] px-5 pb-20 sm:px-7"
      >
        <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
            The harder question
          </span>
          <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
            What would a{" "}
            <em className="italic text-oxblood">verifiable trust layer</em>{" "}
            over all this look like?
          </h2>
        </div>

        <p className="mb-8 max-w-[760px] font-display text-[18px] font-[320] leading-[1.55] text-ink-soft">
          Stage 1 introduced an <code className="font-mono text-[0.9em]">entityMd5</code>{" "}
          — a content fingerprint OCLC publishes alongside each WorldCat
          entity, used by downstream consumers to detect when a record has
          changed. The fingerprint is a useful primitive but it is{" "}
          <em className="italic">change-detection, not tamper-evidence</em>{" "}
          — and it is computed by the same institution whose record it
          attests to. A verifiable trust layer would have to do three
          things the current architecture does not.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <TrustPillar
            label="01"
            heading="Signed change manifests"
            body="Every committed change to an authority record is signed by the cataloger's institution. The signature attests not just that the record changed but that a specific actor — LC, DNB, VIAF — endorsed the change. Verification no longer requires trusting the host. The signature is checkable against the institution's published key."
          />
          <TrustPillar
            label="02"
            heading="Merkle-rooted history"
            body="The ledger of changes is committed to a Merkle tree, with each new entry chained to the previous root hash. A consumer holding a recent root can prove that any earlier entry has not been silently rewritten — and the cluster's history becomes auditable end-to-end with the storage cost of a single hash."
            demonstrated="Demonstrated above on Authority Arc's own ledger — try the verify button on any entry."
          />
          <TrustPillar
            label="03"
            heading="Replicated commitments"
            body="The Merkle roots are co-signed and replicated across multiple authorities — LC, DNB, VIAF, and any peer that wants to participate — so no single host can revise the past unilaterally. Stewardship becomes verifiable in the cryptographic sense, not just the reputational one."
          />
        </div>

        <p className="mt-8 max-w-[760px] font-display text-[16px] font-[320] leading-[1.6] text-ink-soft">
          None of this is exotic. The primitives are forty years old. What
          is missing is a deployment that takes institutional stewardship
          seriously enough to commit to it cryptographically — to say,{" "}
          <em className="italic text-ink">
            here is what we changed, here is who changed it, here is the
            chain that proves we did not rewrite the past.
          </em>{" "}
          The catalog is already keeping the records. The next layer is
          keeping the records keepable.
        </p>
      </section>

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-7">
        <HonestCapability
          demonstrated={[
            "A curated stewardship ledger for one real authority cluster, showing the kinds of changes that real catalog records undergo over their lifetime.",
            "Editorial notes per entry on *why* each change type matters — what it preserves, who acted, and what the institutional logic of the move was.",
            "A working Merkle tree over the ledger: the root is computed at build time over the canonical serialization of every entry; each entry carries its sibling-hash inclusion proof; the browser re-verifies via SubtleCrypto on click. This is the second pillar of the trust-layer proposal, applied to our own data.",
            "A clear framing of what a federated verifiable trust layer over real institutional stewardship would additionally require: signed change manifests, replicated co-signed commitments.",
          ]}
          aspirational={[
            "That the dates shown are the exact dates each event happened. Specific events anchored to public facts (e.g. King's 1985 acknowledgment of Bachman) are accurate; others are representative ranges.",
            "That signed change manifests and federated peer commitments exist today in the bibliographic universe. They do not — VIAF and OCLC ship records but not signatures. The first and third trust-layer pillars remain a forward-looking proposal; only the Merkle-rooted history pillar is demonstrated here, and only over Authority Arc's own curated ledger.",
            "That cryptographic stewardship would replace institutional stewardship. It would not. It would let institutional stewardship be *checkable* without requiring the consumer to trust the host on faith.",
          ]}
          faked={[
            "Specific year-precise dates on the ledger entries are anchored where the underlying event is public (1985 pseudonym reveal, 2003 VIAF launch, 2012 Wikidata launch) and are illustrative otherwise. The change-types are accurate; some calendar-year placements are representative.",
            "OCLC's published entityMd5 is real (visible on every Entities API response); the cryptographic shortcomings explained in Stage 1 are accurate. The signed-manifest and federated-replication pillars are editorial — there is no production deployment of signed authority manifests at OCLC or VIAF as of this writing.",
            "The Merkle root demonstration runs over Authority Arc's own curated ledger, not over real-time edits to VIAF. The primitive is real (SHA-256, standard Merkle proofs, browser-side SubtleCrypto verification); the analogue at OCLC/VIAF scale is the proposal the rest of the trust-layer section frames.",
          ]}
        />
      </section>

      {/* ─── ESSAY ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-5 pb-32 sm:px-7">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
          A note from the curator
        </div>
        <h2 className="m-0 mb-9 font-display text-[clamp(34px,5vw,56px)] font-[360] leading-[1.02] tracking-[-0.02em]">
          The most radical thing a library does is{" "}
          <em className="italic text-oxblood">keep remembering</em>.
        </h2>

        <p className="font-display text-[19px] font-[320] leading-[1.65] text-ink first-line:tracking-wide">
          <span className="float-left mr-2.5 pt-1 font-display text-[4.4em] font-[380] leading-[.85] text-oxblood">
            A
          </span>
          modern technology stack maintains its identifiers for as long as
          the company that owns them remains solvent. A library catalog
          maintains its identifiers for as long as the institution remains.
          The difference matters because the time horizons are different by
          orders of magnitude — and because the work to bridge that gap is
          done in public, by people who are usually not paid commensurate
          with the responsibility.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The premise of this arc has been that the discipline of
          cataloging is a kind of identity engineering — older than the
          web, broader in scope than most modern entity-resolution systems,
          and conducted under a much harder constraint: the answers have
          to stay <em className="italic text-ink-soft">true</em>, not just
          locally correct.{" "}
          <em className="italic text-ink-soft">
            Stewardship is the part that does not show up on the page.
          </em>{" "}
          The identifier on top of every record is the visible end of a
          promise that thousands of people, over decades, have agreed to
          keep.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          If the modern era brings any improvement to this picture, it is
          not algorithmic. The cataloging work itself will not be
          automated; it requires judgment about evidence, and the evidence
          itself is unstructured human testimony. What modern primitives
          can offer is the layer beneath the work — a way to make the
          stewardship checkable, to chain the changes to a public log, to
          let a consumer in 2080 verify that a record they see today is
          the record their predecessor wrote, signed by the institution
          that wrote it.
        </p>

        <hr className="my-10 border-none text-center text-ochre-deep before:tracking-[1em] before:content-['✦__✦__✦']" />

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The five rooms of this museum end here. What it is meant to
          leave you with is not a feeling that any of this is solved —{" "}
          <em className="italic text-ink-soft">none of it is</em> — but a
          better sense of which problems are old, which are new, and which
          ones the field has been quietly thinking about longer than any
          of the names you would normally associate with them.{" "}
          <em className="italic text-ink-soft">
            The catalog is one of the longest-running working identity
            systems on the planet.
          </em>{" "}
          It is worth knowing what shape it has.
        </p>
      </section>
    </StagePage>
  );
}

function TrustPillar({
  label,
  heading,
  body,
  demonstrated,
}: {
  label: string;
  heading: string;
  body: string;
  /** If present, a "working demonstration" badge sits on the pillar. */
  demonstrated?: string;
}) {
  return (
    <article
      className={
        "relative rounded-[2px] border bg-paper-deep p-5 shadow-paper " +
        (demonstrated ? "border-[#5a7a3a]" : "border-paper-edge")
      }
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[24px] font-[320] text-oxblood">
          {label}
        </span>
        <h3 className="m-0 font-display text-[18px] font-[400] tracking-[-0.01em] text-ink">
          {heading}
        </h3>
      </div>
      <p className="mt-3 font-display text-[14.5px] leading-[1.55] text-ink-soft">
        {body}
      </p>
      {demonstrated && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-[2px] border border-[#5a7a3a] bg-paper px-2 py-1 font-mono text-[9.5px] uppercase tracking-eyebrow text-[#3f5a2a]">
          <span aria-hidden="true">●</span>
          <span>{demonstrated}</span>
        </p>
      )}
    </article>
  );
}
