# Concrete Recommendations: OCLC WorldCat Entities API Access for Authority Arc

> Captured from a chat about whether this project needs an OCLC Meridian subscription
> to use the WorldCat Entities data API.

## Source: OCLC documentation summary

The WorldCat Entities data API has three access tiers:

- **Anyone / unauthenticated** — Limited WorldCat Entities properties and data access.
- **WSKey** (free, no subscription required) — Additional properties beyond the unauthenticated tier.
- **OCLC Meridian subscribers** (paid) — Full read access to WorldCat Entities properties and data.

All three tiers use the same JSON-LD GET endpoint pattern, e.g.:

```
GET https://id.oclc.org/worldcat/entity/E39PBJymGv6xMdcX3dQdb48KVC.jsonld
```

Context / standard URLs:

- https://id.oclc.org/api/context.json
- https://emm-spec.org/0.1/context.json

Meridian quote requests: https://www.oclc.org/en/meridian.html#productpg_ctablock

---

## Short answer

You do **not** need a Meridian subscription for what Authority Arc currently does — but
you will if/when you implement the "planned" Stage 5 features that
[docs/SOURCES.md](docs/SOURCES.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md)
already describe.

## Tier-by-tier mapping against this repo

| Tier | What it gets you | Authority Arc need |
|---|---|---|
| **Unauthenticated** (`*.jsonld` GET on `id.oclc.org`) | Read a single entity's public properties (label, type, a few identifiers, basic links) | Sufficient for Stage 1 (Identify) and Stage 4 (Connect) *display-only* lookups, since the project already leans on VIAF for the heavy lifting. You can resolve a known WorldCat Entity URI and render its public JSON-LD with zero credentials. |
| **Free WSKey** | Same endpoint, more properties exposed (richer cross-refs, more relationship data) | Recommended for Stage 4 (Connect) and richer Stage 3 (Classify) panels. **No subscription, no cost — just request a WSKey.** This is almost certainly the tier you want for the public demo. |
| **Meridian** (paid) | Full read access **plus** the API *family* listed in `SOURCES.md`: PID Lookup, Entity Search, Entity **Connections**, Entity **Changes**, Entity Management, Entity Query | Required only if you want to: (a) do live OCLC PID Lookup as a server-side resolver alongside VIAF, (b) drive Stage 5 (Maintain) from the real **Entity Changes** feed instead of the curated `king-ledger.json` fixture, or (c) do live entity *search* (not just GET-by-URI). |

## Concrete recommendations for this repo

1. **Now**: Request a free WSKey. It unlocks the WSKey-tier properties on the same
   `id.oclc.org/worldcat/entity/{id}.jsonld` endpoint, costs nothing, and lets you
   replace some of the curated Connect/Classify fixtures with live calls.

2. **Update the docs honestly**:
   - [docs/SOURCES.md](docs/SOURCES.md) line 18 currently says the whole Entities
     family is "gated on Meridian." That's true for *Search / Changes / Management /
     Query*, but **not** for `.jsonld` GET-by-URI — split that bullet into
     "unauthenticated," "WSKey," and "Meridian-only" rows so the access requirement
     isn't oversold.
   - [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) "What changes when Meridian access
     lands" can stay; add a smaller "What changes when a WSKey lands" section above it.

3. **Defer Meridian** until Stage 5's Merkle / ledger work is ready to consume a real
   Entity Changes feed. Until then, the fixture-driven
   [lib/merkle.ts](lib/merkle.ts) + [data/fixtures/maintain/king-ledger.json](data/fixtures/maintain/king-ledger.json)
   story is the honest representation, and the "provenance pill (live vs. fixture
   fallback)" pattern from Stage 1 is the right model to extend.

## Optional follow-up work

- Patch [docs/SOURCES.md](docs/SOURCES.md) to reflect the three-tier split.
- Stub a `lib/oclc-entity.ts` that does the unauthenticated `.jsonld` fetch now and
  accepts an optional `OCLC_WSKEY` env var, so the key can drop in later without a
  refactor.
