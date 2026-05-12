import type { Metadata } from "next";
import { StageStub } from "@/components/shared/stage-stub";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Stage 4 of the Authority Arc — authority data is a knowledge graph. Walk outward from any entity and watch the structure of human knowledge render itself.",
};

export default function ConnectPage() {
  return (
    <StageStub
      num="04"
      title="Connect"
      subtitle={
        <>
          What does it <em className="italic text-oxblood">touch</em>?
        </>
      }
      description="Authority data is a knowledge graph rendered in real time from sixty years of cataloging. Pick a starting entity — Stephen King, Toni Morrison, Octavia Butler — and walk outward: works by, works about, influences, contemporaries, related subjects, citations. This is what Wikidata is trying to be and what every RAG system needs."
      whatWeWillBuild={[
        "A graph explorer rooted in any VIAF cluster or WorldCat Entity. Click a node to walk to its neighbors.",
        "A 'find the path between X and Y' tool — Kevin-Bacon-style — between any two entities in the available graph.",
        "Real Citations API output: the work-to-work citation graph, with hops you can explore.",
        "Honest acknowledgement of the graph's gaps. Some clusters are dense; others have only a single edge. The page explains why.",
      ]}
      prev={{ slug: "classify", num: "03", title: "Classify" }}
      next={{ slug: "maintain", num: "05", title: "Maintain" }}
    />
  );
}
