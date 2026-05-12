import type { Metadata } from "next";
import { StageStub } from "@/components/shared/stage-stub";

export const metadata: Metadata = {
  title: "Classify",
  description:
    "Stage 3 of the Authority Arc — Dewey is a tree, FAST is a graph, and the same book gets classified both ways.",
};

export default function ClassifyPage() {
  return (
    <StageStub
      num="03"
      title="Classify"
      subtitle={
        <>
          Where does it sit in{" "}
          <em className="italic text-oxblood">human knowledge</em>?
        </>
      }
      description="Dewey is hierarchical, deterministic, geographical — a book belongs at one number. FAST is faceted — one book gets multiple headings that intersect across Topic, Geographic, Personal Name, Corporate, Event, Form, and Chronological dimensions. The difference between a tree and a graph, taught with real records."
      whatWeWillBuild={[
        "Side-by-side classification of one book under Dewey and FAST. Watch the dimensionality difference render.",
        "An interactive 'classify it yourself' for a contested example — a biography of MLK is 323.092 in Dewey, but in FAST it gets Personal Name + Topic + Geographic + Chronological.",
        "The Dewey Linked Data API rendered as a navigable hierarchy: from the broadest class down to the most specific subdivision.",
        "FAST's seven facets, with the FAST API surfacing real headings for any cluster from Stage 2.",
      ]}
      prev={{ slug: "disambiguate", num: "02", title: "Disambiguate" }}
      next={{ slug: "connect", num: "04", title: "Connect" }}
    />
  );
}
