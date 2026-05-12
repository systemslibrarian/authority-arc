import type { Metadata } from "next";
import { StageStub } from "@/components/shared/stage-stub";

export const metadata: Metadata = {
  title: "Disambiguate",
  description:
    "Stage 2 of the Authority Arc — how authority systems decide that two records describe the same person, or don't.",
};

export default function DisambiguatePage() {
  return (
    <StageStub
      num="02"
      title="Disambiguate"
      subtitle={
        <>
          Which <em className="italic text-oxblood">Stephen King</em>?
        </>
      }
      description="There are hundreds of Stephen Kings in the world's catalogs. The discipline that resolves them — cluster by cluster, evidence by evidence — is the same problem as deduplicating customer records, merging Salesforce contacts, or resolving Wikidata items. Librarians have been doing it longer than anyone."
      whatWeWillBuild={[
        "An autosuggest field that hits VIAF's AutoSuggest endpoint live, returning the ranked clusters that match a free-text query.",
        "Side-by-side rendering of two source records (LC and DNB, say) so the visitor can vote — same person, or two? — before VIAF reveals what it decided.",
        "A walk through one real, contested cluster: the moment of merge, the evidence that triggered it, and what the failure modes look like when VIAF gets it wrong.",
        "An honest catalog of the kinds of disagreement that exist: pseudonym links, transliteration variants, contested dates, posthumous merges.",
      ]}
      prev={{ slug: "identify", num: "01", title: "Identify" }}
      next={{ slug: "classify", num: "03", title: "Classify" }}
    />
  );
}
