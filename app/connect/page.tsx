import type { Metadata } from "next";
import {
  StagePage,
  Exhibit,
  ContinueCallout,
  HonestCapability,
} from "@/components/shared/stage-page";
import { Neighborhood } from "@/components/stage4/neighborhood";
import { EntitySearch } from "@/components/stage4/entity-search";
import {
  listConnectRecords,
  type ConnectRecord,
} from "@/lib/connect-records";
import { wikidataNeighborhood } from "@/lib/wikidata";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Stage 4 of the Authority Arc — authority data is a knowledge graph. Walk outward from one entity, live, and read what each kind of edge actually asserts.",
};

// Stage 4 reads live data; tell Next to render this route per-request so
// the SPARQL call runs on every visit (cached for 1h by lib/wikidata.ts).
export const dynamic = "force-dynamic";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const requestedId = (searchParams?.q ?? "Q39829").trim().toUpperCase();
  // Prefer the curated record when one exists for this entity; otherwise
  // hit Wikidata SPARQL live.
  const curated = listConnectRecords().find(
    (r) => r.entity.wikidata.toUpperCase() === requestedId
  );
  let record: ConnectRecord;
  let liveError: string | null = null;
  let isCurated = false;
  if (curated) {
    record = curated;
    isCurated = true;
  } else if (/^Q\d+$/.test(requestedId)) {
    try {
      record = await wikidataNeighborhood(requestedId);
    } catch (err: any) {
      // On upstream failure, fall back to the King fixture and surface
      // the error as a banner inside the page.
      record = listConnectRecords()[0];
      isCurated = true;
      liveError = `Wikidata SPARQL unreachable for ${requestedId} — showing the curated King neighborhood instead.`;
    }
  } else {
    record = listConnectRecords()[0];
    isCurated = true;
    liveError = `"${requestedId}" is not a Wikidata Q-identifier — showing the curated King neighborhood.`;
  }
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
            <em className="italic text-oxblood">labeled edges</em>
          </>
        }
        intro={
          <>
            Each block below is a kind of relationship — a Wikidata
            property, a curated set, or a derived overlap from Stage 3's
            FAST headings. Click any block to read what that edge type
            actually asserts and why the graph is sparse or dense there.
            Each neighbor with a Wikidata ID is itself a doorway: click to
            walk into <em>that</em> entity's neighborhood. Sparsely-edited
            authors will render sparser views — the sparsity is the lesson.
          </>
        }
      >
        <div className="mb-6">
          <EntitySearch
            currentId={record.entity.wikidata || requestedId}
            isCurated={isCurated}
          />
        </div>
        {liveError && (
          <div
            role="alert"
            className="mb-6 rounded-[2px] border border-oxblood/40 bg-paper p-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
              Live fallback engaged
            </p>
            <p className="mt-1 font-display text-[14px] text-ink">
              {liveError}
            </p>
          </div>
        )}
        <Neighborhood record={record} />
      </Exhibit>

      {/* ─── HONEST CAPABILITY ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-7">
        <HonestCapability
          demonstrated={[
            "Live SPARQL against Wikidata's Query Service for any Q-identifier: notable works (P800), influenced by (P737), and works whose main subject is this entity (reverse-P921).",
            "Curated King fixture overrides live mode and adds two extra relationship blocks (contemporaries, shared subjects) that are not directly queryable as single Wikidata predicates.",
            "Per-edge-type editorial notes explaining what that relationship asserts and why the graph is sparse or dense at that edge.",
            "Graph-walk traversal: each Wikidata-bearing neighbor is a doorway to its own neighborhood, with the URL state preserved so the walk is shareable.",
            "A closing 'sparsity note' that ties Stage 4 to the larger lesson: knowledge graphs are dense where attention has been invested and sparse elsewhere — sparsity is a signal, not a flaw. Sparsely-edited entities now render visibly sparser views.",
          ]}
          aspirational={[
            "That any entity's neighborhood is complete. It is what Wikidata has indexed — many influences exist in biographies that never made it into the graph because they were not confirmed by the person themselves.",
            "That live mode shows everything curated mode does. It does not — contemporaries and shared-subject overlaps are curated supplements unique to entities we have prepared (currently just King).",
            "That a generic 'graph explorer' would have been pedagogically equivalent. Generic force-directed graphs look impressive and obscure the meaning of edges; the labeled-edge-type framing is a deliberate constraint.",
          ]}
          faked={[
            "The 'Contemporaries' block on the curated King record is hand-picked rather than derived from a Wikidata query. There is no single property that means 'contemporary'; the catalog has to construct that relationship from birth-year + nationality + field.",
            "The 'Subjects in common' block on the curated King record is illustrative — three high-signal overlaps, not a complete join. A real intersection of FAST headings would be tens of thousands of edges and would teach nothing about structure.",
            "Editorial notes per relationship are condensed for legibility, not generated from the raw Wikidata schema. The properties (P800, P737, P921) are accurate; the framing of what each one asserts is ours.",
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
