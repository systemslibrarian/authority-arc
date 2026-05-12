import type { Metadata } from "next";
import { StageStub } from "@/components/shared/stage-stub";

export const metadata: Metadata = {
  title: "Maintain",
  description:
    "Stage 5 of the Authority Arc — identity is not a snapshot, it is a stream. The stage where fingerprints become signatures and trust becomes verifiable.",
};

export default function MaintainPage() {
  return (
    <StageStub
      num="05"
      title="Maintain"
      subtitle={
        <>
          Identity as <em className="italic text-oxblood">stewardship</em>.
        </>
      }
      description="Names change. Records get corrected. Entities get merged, split, transliterated, and re-transliterated. Identity is not a snapshot — it is a stream, and someone has to tend to it. Cataloging is the ongoing care of identity, meaning, relationships, and trust. This stage uses OCLC's Entity Changes API to render the work of stewardship in real time, then asks the harder question: what would it take to verify a record against a hash we did not have to trust OCLC for?"
      whatWeWillBuild={[
        "A live view of the Entity Changes feed — pick an entity and watch every act of stewardship scroll past in real time, with diffs.",
        "A walk through the entity history endpoint for one well-known cluster, showing every revision since first ingestion and the curator that made it.",
        "A scenario: corrupt a record, demonstrate that the change feed catches it, then walk through how a determined attacker could forge the same record under MD5.",
        "The Trust Layer proposal: signed change manifests, Merkle-tree audit logs over the authority graph, HMAC-chained sync receipts. Where Stage 1's fingerprint becomes Stage 5's signature, and stewardship becomes verifiable.",
      ]}
      prev={{ slug: "connect", num: "04", title: "Connect" }}
    />
  );
}
