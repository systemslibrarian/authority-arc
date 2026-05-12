import type { Metadata } from "next";
import {
  StagePage,
  Exhibit,
  ContinueCallout,
  HonestCapability,
} from "@/components/shared/stage-page";
import { Neighborhood } from "@/components/stage4/neighborhood";
import { listConnectRecords } from "@/lib/connect-records";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Stage 4 of the Authority Arc — authority data is a knowledge graph. Walk outward from one entity and read what each kind of edge actually asserts. The older institutional cousin of the graph work that modern systems quietly depend on.",
};

export default function ConnectPage() {
  const record = listConnectRecords()[0];
  return (
    <StagePage
      num="04"
      word="Four"
      title="Connect"
      headline={
        <>
          What does it <em className="italic text-oxblood">touch</em>?
        </>
      }
      aside={
        <>
          Identity is{" "}
          <em className="italic">what an entity is connected to</em>. The
          edges carry the meaning.
        </>
      }
      intro={
        <>
          Stage 3 ended with FAST hinting at the graph. Stage 4 walks it. An
          entity sits at the center; outward from it run labeled edges —
          works by, works about, influenced by, contemporaries, subjects in
          common.{" "}
          <em className="italic text-ink">
            The lesson is not the rendering. It is that each kind of edge
            asserts something different, and the catalog is sparse or dense
            at each edge type for reasons worth knowing.
          </em>{" "}
          This is the older institutional cousin of the knowledge-graph work
          that modern search engines, RAG pipelines, and entity-resolution
          systems quietly depend on.
        </>
      }
      prev={{ slug: "classify", num: "03", title: "Classify" }}
      next={{ slug: "maintain", num: "05", title: "Maintain" }}
      continueCallout={
        <ContinueCallout
          slug="maintain"
          num="05"
          word="Five"
          title="Maintain"
          hook={
            <em className="italic text-oxblood">identity as stewardship</em>
          }
          body={
            <>
              The graph you just walked was a snapshot. Cluster boundaries
              shift, edges get added, names get corrected, pseudonyms get
              linked decades after the fact. Stage 5 watches the catalog
              edit itself — and asks what a verifiable trust layer over all
              this looks like.
            </>
          }
        />
      }
    >
      {/* ─── EXHIBIT A: NEIGHBORHOOD ───────────────────────────── */}
      <Exhibit
        label="Exhibit A"
        heading={
          <>
            One entity,{" "}
            <em className="italic text-oxblood">five kinds of edge</em>
          </>
        }
        intro={
          <>
            Each block below is a kind of relationship — a Wikidata
            property, a curated set, or a derived overlap from Stage 3's
            FAST headings. Click any block to read what that edge type
            actually asserts and why the graph is sparse or dense there.
            The point is to make the relationship's <em>meaning</em>{" "}
            legible, not to render an impressive cloud of dots.
          </>
        }
      >
        <Neighborhood record={record} />
        <p className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ochre" />
          <span>Curated · Wikidata edges captured statically; live SPARQL fallback is on the roadmap</span>
        </p>
      </Exhibit>

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-7">
        <HonestCapability
          demonstrated={[
            "Five distinct relationship types for one real entity, each labeled with the Wikidata property (or curated source) that backs it.",
            "Per-edge-type editorial notes explaining what that relationship asserts and why the graph is sparse or dense at that edge.",
            "A closing 'sparsity note' that ties Stage 4 to the larger lesson: knowledge graphs are dense where attention has been invested and sparse elsewhere — sparsity is a signal, not a flaw.",
          ]}
          aspirational={[
            "That this entity's neighborhood is complete. It is a curated subset; Wikidata has dozens of additional properties for King (place of birth, residences, awards, family) that we did not surface in order to keep the lesson focused on the five kinds of edge that recur for any cultural figure.",
            "That the visitor can walk to any of these neighbors and see their neighborhood in turn. That graph-walk traversal is on the roadmap; in this version each neighbor is a labeled chip, not a clickable next-step.",
            "That a generic 'graph explorer' would have been pedagogically equivalent. Generic force-directed graphs look impressive and obscure the meaning of edges; the labeled-edge-type framing is a deliberate constraint.",
          ]}
          faked={[
            "The 'Contemporaries' set is curated rather than derived from a Wikidata query. There is no single property that means 'contemporary'; the catalog has to construct that relationship from birth-year + nationality + field.",
            "The 'Subjects in common' set is illustrative — three high-signal overlaps, not a complete join. A real intersection would be tens of thousands of edges and would teach nothing about structure.",
            "Live Wikidata SPARQL is not wired in this version; the curated path lets us pick pedagogically clear edges instead of accepting whatever the public graph happens to expose at any moment.",
          ]}
        />
      </section>

      {/* ─── ESSAY ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-5 pb-32 sm:px-7">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
          A note from the curator
        </div>
        <h2 className="m-0 mb-9 font-display text-[clamp(34px,5vw,56px)] font-[360] leading-[1.02] tracking-[-0.02em]">
          A graph is{" "}
          <em className="italic text-oxblood">what the editors looked at</em>.
        </h2>

        <p className="font-display text-[19px] font-[320] leading-[1.65] text-ink first-line:tracking-wide">
          <span className="float-left mr-2.5 pt-1 font-display text-[4.4em] font-[380] leading-[.85] text-oxblood">
            T
          </span>
          he naive read of any knowledge graph is that the edges are{" "}
          <em className="italic text-ink-soft">facts about the world</em>.
          The accurate read is that the edges are{" "}
          <em className="italic text-ink-soft">facts about what someone has bothered to record</em>.
          The two are usually correlated, but they are not the same.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          When Wikidata's edge from Stephen King to H. P. Lovecraft is
          dense — when King has said in interviews, essays, and his memoir
          that Lovecraft mattered to him — the edge is well-supported. When
          the edge to a less-canonized horror writer is missing, it does
          not mean the influence didn't exist. It means an editor with an
          interest in that lineage has not yet sat down to add it.
        </p>

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          This is also why mixed-method retrieval systems —{" "}
          <em className="italic text-ink-soft">retrieval-augmented
          generation</em>, the current generation of search-plus-LLM
          architectures — rely so heavily on these graphs as a backbone.
          The text in the corpus tells you what an author wrote. The graph
          tells you what they are <em className="italic text-ink-soft">connected to</em>,
          and the connection is what makes the retrieval more than keyword
          matching. A graph that asserts "King ↔ Lovecraft (influenced
          by)" lets a query about cosmic horror find King through Lovecraft
          even when the query text never names him.
        </p>

        <hr className="my-10 border-none text-center text-ochre-deep before:tracking-[1em] before:content-['✦__✦__✦']" />

        <p className="mt-5 font-display text-[19px] font-[320] leading-[1.65] text-ink">
          The graph you just walked was a snapshot. In a working catalog,
          the edges shift constantly — corrections, additions, splits,
          merges. The next room is about what it means for an identity
          system to <em className="italic text-ink-soft">stay true</em>{" "}
          over time, and what a verifiable layer over all this would
          actually require.
        </p>
      </section>
    </StagePage>
  );
}
