/**
 * Honest Capability section — borrowed from the Meow Decoder pattern of
 * "explicit threat model, fail-closed posture, honest accounting of what
 * does and doesn't hold." It belongs on every stage page.
 *
 * The three columns are intentionally named:
 *   - DEMONSTRATED: the live thing, reproducible from the source code.
 *   - ASPIRATIONAL: the lesson the page implies but does not prove.
 *   - FAKED:        narrative liberties taken for clarity, with explanation.
 *
 * A page with no FAKED column is dishonest. A page where DEMONSTRATED is
 * smaller than the claims is misleading. The discipline is to keep these
 * three lists accurate as the page evolves.
 */

export function HonestCapability() {
  return (
    <section className="mt-24 border-t border-rule pt-12">
      <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
          Honest Capability
        </span>
        <h3 className="m-0 flex-1 font-display text-[24px] font-[380] tracking-[-0.01em]">
          What this page <em className="italic text-oxblood">actually</em> does,
          and what it doesn't.
        </h3>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Column
          tone="green"
          label="Demonstrated"
          subtitle="Reproducible from the source code"
          items={[
            "Live VIAF lookups by (curator, id), normalized to a stable JSON shape.",
            "The full cluster of sameAs identifiers across 20+ national authorities.",
            "Curator detail panel grounded in a hand-curated registry (lib/curators.ts).",
            "Bundled fixtures for offline mode; the page works without a network.",
            "Failure cases — bad input, 404, upstream timeout — rendered as data, not hidden.",
          ]}
        />
        <Column
          tone="amber"
          label="Aspirational"
          subtitle="What the page implies but does not prove"
          items={[
            "That OCLC's promise of persistence will outlive any one source authority. That promise is institutional, not cryptographic — Stage 5 returns to this.",
            "That cluster membership is a fact rather than a current best-effort consensus. The clusters split and re-merge as evidence accumulates.",
            "That the entityMd5 fingerprint is integrity. It is change-detection, not tamper-evidence. We trust OCLC's hash of OCLC's record.",
          ]}
        />
        <Column
          tone="red"
          label="Faked, with cause"
          subtitle="Narrative liberties, named honestly"
          items={[
            "Two lines on the wall are drawn as 'disagreement' (oxblood, dashed differently) for narrative effect. The actual disagreement set requires Entity Connections API access, which gates on a Meridian subscription.",
            "The 'OCLC Entity URI' chit on the wall shows a placeholder shape (E39PBJqv…8mF). The real entity URI for King's WorldCat record requires the Entities API. Until access is provisioned, this remains illustrative.",
            "The entityMd5 field on the resolver card is empty when VIAF is the source. VIAF does not publish a content hash. The annotation says so.",
          ]}
        />
      </div>
    </section>
  );
}

function Column({
  tone,
  label,
  subtitle,
  items,
}: {
  tone: "green" | "amber" | "red";
  label: string;
  subtitle: string;
  items: string[];
}) {
  const bar = {
    green: "border-[#5a7a3a]",
    amber: "border-ochre",
    red: "border-oxblood",
  }[tone];

  return (
    <div className={`border-l-[3px] ${bar} pl-5`}>
      <div className="font-mono text-[10px] font-medium uppercase tracking-eyebrow text-ink-faint">
        {label}
      </div>
      <div className="mt-1 font-display text-[14px] italic text-ink-soft">
        {subtitle}
      </div>
      <ul className="mt-4 list-none space-y-3 p-0">
        {items.map((item, i) => (
          <li
            key={i}
            className="font-display text-[15px] leading-[1.55] text-ink"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
