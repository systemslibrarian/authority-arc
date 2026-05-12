# Honest Capability

This document is the cumulative version of the per-page Honest Capability sections that appear on each stage. Three columns: what each page demonstrates, what it implies but does not prove, and where it takes narrative liberties for clarity.

This ledger is updated with every PR that changes what a stage shows.

---

## Stage 01 — Identify

### Demonstrated
- Live VIAF lookups by `(curator, id)`, normalized to a stable JSON shape (`lib/viaf.ts`).
- The full cluster of sameAs identifiers across 20+ national authorities.
- Curator detail panel grounded in a hand-curated registry (`lib/curators.ts`).
- Bundled fixtures for offline mode (`data/fixtures/`); the page works without a network.
- Failure cases — bad input, 404, upstream timeout — rendered as data, not hidden.

### Aspirational
- That OCLC's promise of persistence will outlive any one source authority. That promise is institutional, not cryptographic — Stage 5 returns to this.
- That cluster membership is a fact rather than a current best-effort consensus. The clusters split and re-merge as evidence accumulates.
- That the `entityMd5` fingerprint is integrity. It is change-detection, not tamper-evidence. We trust OCLC's hash of OCLC's record.

### Faked, with cause
- Two lines on the wall are drawn as "disagreement" (oxblood, dashed differently) for narrative effect. The actual disagreement set requires Entity Connections API access, which gates on a Meridian subscription.
- The "OCLC Entity URI" chit on the wall shows a placeholder shape (`E39PBJqv…8mF`). The real entity URI requires the Entities API.
- The `entityMd5` field on the resolver card is empty when VIAF is the source. VIAF does not publish a content hash. The annotation says so.

---

## Stage 02 — Disambiguate

*Status: in preparation.*

### Planned demonstrated
- VIAF AutoSuggest endpoint integration.
- Side-by-side rendering of two source records (e.g., LC vs DNB) for a single contested cluster.
- A real, named disambiguation case walked through end-to-end.

### Planned aspirational
- That clustering decisions are reproducible. They are not always — VIAF re-clusters periodically as upstream authorities revise their records.

### Planned faked, with cause
- TBD as the page takes shape.

---

## Stage 03 — Classify

*Status: in preparation.*

---

## Stage 04 — Connect

*Status: in preparation.*

---

## Stage 05 — Maintain

*Status: in preparation. This stage is where the project's threat model expands — see `docs/THREAT_MODEL.md`.*

---

## How to use this document

When you change a stage's behavior, update both:

1. The on-page `<HonestCapability />` section for that stage.
2. The corresponding section here.

If the two drift, that is a bug, not a stylistic preference. The discipline is the product.
