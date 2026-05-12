/**
 * Stage 2 — catalog of disagreement kinds.
 *
 * Editorial section listing the structural reasons VIAF (and any other
 * authority system) finds itself merging or splitting clusters. Not
 * interactive; the lesson is that disagreement comes in named types, and
 * naming them well is half of the cataloger's craft.
 */

interface Kind {
  label: string;
  pitch: string;
  body: string;
  example: string;
}

const KINDS: Kind[] = [
  {
    label: "Pseudonym link",
    pitch: "Two name forms, one person.",
    body: "The most documented disagreement: a writer publishes under one name and lives under another, and the catalog must decide whether to keep both records or unify them under one preferred heading. The link is typically provable from the person's own correspondence, a contemporary biographer, or a publisher's records.",
    example:
      "Mark Twain ↔ Samuel L. Clemens · George Eliot ↔ Mary Ann Evans · le Carré ↔ Cornwell",
  },
  {
    label: "Transliteration variant",
    pitch: "Same person, different alphabet.",
    body: "A name moves between writing systems and accumulates spellings. Russian names in particular split across ALA-LC, BGN/PCGN, ISO 9, and library-local schemes — and across decades, since transliteration practice itself changes. The cluster must hold all of them without making any one the truth.",
    example:
      "Чайковский → Tchaikovsky · Tchaïkovsky · Chaikovskii · Čajkovskij",
  },
  {
    label: "Contested dates",
    pitch: "When the records disagree about a year.",
    body: "Birth and death years are the strongest disambiguation signal — and they are also among the most commonly wrong. A 19th-century author may have a birth year that varies by three years across the national authorities, depending on which baptismal record, census, or self-report was used. The cataloger has to pick one or note the range.",
    example:
      "Christopher Marlowe — 1564 across most authorities, but some 18th-century sources record 1563.",
  },
  {
    label: "Posthumous merge",
    pitch: "Two records become one decades later.",
    body: "An author publishes under a pseudonym in life and the link is only confirmed after their death (or, sometimes, after they themselves confirm it in old age). The catalog must merge two records that had been separately maintained — sometimes for half a century — into one cluster, while preserving the access points so existing citations still resolve.",
    example:
      "Robert Galbraith ↔ J. K. Rowling, 2013 — three months of separate maintenance, then merged.",
  },
  {
    label: "Posthumous split",
    pitch: "A merged record turns out to be two people.",
    body: "The reverse case, which is rarer but cleaner to demonstrate: someone in the 19th century cataloged two distinct people under a single entry because the source documents looked similar enough. Later evidence (new archival material, a discovered passport, a contradictory date) forces the cluster to be split — and every record that pointed at the old cluster has to be rerouted.",
    example:
      "Multiple known cases in medieval and early-modern hagiography where two saints with similar names were unified for centuries before being re-separated.",
  },
  {
    label: "Anonymous attribution",
    pitch: "A work without a confident author.",
    body: "Some works can only be attributed to 'Author of <other work>' or to a uniform title that floats outside any person cluster. The authority record becomes the link itself — a placeholder that may, decades later, get tied to a real person if new evidence surfaces.",
    example:
      "'Author of the Cloud of Unknowing' — a real LC heading. No person cluster, but a stable identity.",
  },
];

export function DisagreementTypes() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-7 sm:pb-20">
      <div className="mb-8 flex items-baseline gap-6 border-b border-rule pb-3.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ochre-deep">
          Field guide
        </span>
        <h2 className="m-0 flex-1 font-display text-[28px] font-[380] tracking-[-0.01em]">
          The kinds of disagreement, named
        </h2>
      </div>
      <p className="mb-10 max-w-[760px] font-display text-[18px] font-[320] leading-[1.55] text-ink-soft">
        Disagreement between authority records isn't a failure case — it is the
        normal condition of a working catalog. The discipline gives the
        recurring shapes their own names so a future cataloger can see, at a
        glance, which kind of disagreement they are looking at.
      </p>

      <div className="grid gap-7 md:grid-cols-2">
        {KINDS.map((k) => (
          <article
            key={k.label}
            className="border-l-[3px] border-paper-edge pl-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="m-0 font-display text-[20px] font-[400] tracking-[-0.01em] text-ink">
                {k.label}
              </h3>
              <span className="font-mono text-[9.5px] uppercase tracking-eyebrow text-oxblood">
                Type
              </span>
            </div>
            <p className="mt-1 font-display text-[14.5px] italic text-ink-soft">
              {k.pitch}
            </p>
            <p className="mt-3 font-display text-[15px] font-[320] leading-[1.55] text-ink">
              {k.body}
            </p>
            <p className="mt-3 font-mono text-[11.5px] leading-[1.45] text-ink-faint">
              <span className="text-oxblood">e.g. </span>
              {k.example}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
