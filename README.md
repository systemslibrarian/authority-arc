# The Authority Arc

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 14"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-22c55e?style=flat-square" alt="CC BY-NC-SA 4.0 License"></a>
</p>

<p align="center">
  <em>A five-stage learning path through library identity — taught through OCLC and VIAF.</em>
</p>

## How Librarians Solved Identity, Decades Before Big Tech Tried

Every digital object has many names. The work of keeping those names in agreement — of deciding when two strings refer to the same thing and when they do not — is one of the foundational hard problems in computing. Catalogers and reference librarians have been doing a version of this work longer than most modern software identity systems have existed.

The Authority Arc is a walking tour of how. Five stages, each built around a different family of OCLC and VIAF APIs:

| # | Stage | The Question | Status |
|---|-------|--------------|--------|
| 01 | **Identify** | *What is this thing, really?* | ✅ Live |
| 02 | **Distinguish** | *Which Stephen King?* | ✅ Live |
| 03 | **Classify** | *Where does it sit in human knowledge?* | ✅ Live |
| 04 | **Connect** | *What does it touch?* | ✅ Live |
| 05 | **Maintain** | *How does it stay true over time?* | ✅ Live |

---

## Quick Links

<p align="center">
  🌐 <a href="https://authority-arc.vercel.app">Live Site</a> &nbsp;|&nbsp;
  🏛️ <a href="https://authority-arc.vercel.app/identify">Identify</a> &nbsp;|&nbsp;
  🔀 <a href="https://authority-arc.vercel.app/disambiguate">Distinguish</a> &nbsp;|&nbsp;
  🗂️ <a href="https://authority-arc.vercel.app/classify">Classify</a> &nbsp;|&nbsp;
  🔗 <a href="https://authority-arc.vercel.app/connect">Connect</a> &nbsp;|&nbsp;
  🛡️ <a href="https://authority-arc.vercel.app/maintain">Maintain</a>
</p>

<p align="center">
  📜 <a href="./docs/THREAT_MODEL.md">Threat Model</a> &nbsp;|&nbsp;
  📚 <a href="./docs/SOURCES.md">Sources & Attribution</a> &nbsp;|&nbsp;
  📝 <a href="./docs/HONEST_CAPABILITY.md">Honest Capability</a>
</p>

---

## Why The Authority Arc Exists

Identity resolution is invisible to most software engineers. Auth0, Okta, and Wikidata-the-knowledge-graph all feel like recent inventions. They are not. The discipline that powers them — *this thing has many names; here is how we keep them in agreement; here is what we do when they disagree* — has been carried out at scale, in the open, by national libraries and OCLC for over half a century.

The arc moves from *"Who is this?"* to *"How does the knowledge graph know?"* — and ends with the older, harder question of how that knowing is kept true over time. Cataloging is not clerical work. It is the ongoing **stewardship** of identity, meaning, relationships, and trust, performed daily by people whose job titles do not say *"persistent identifier engineer."*

The intended audience is:

- **Software engineers** who have built or maintained an identity-resolution system and want to see how the people who have been at it longest do it.
- **Library science students** who learn these concepts abstractly and have never touched the APIs that live underneath.
- **Linked-data and semantic-web practitioners** who keep rediscovering things VIAF and FAST have shipped for decades.
- **AI / ML / RAG people** working on entity disambiguation, knowledge graphs, and retrieval systems who would benefit from a serious look at how this is done outside their immediate field.

Each stage teaches one concept with a live, working interactive.

## What this is, and what it isn't

This is **an interactive window into a living system.** VIAF, FAST, Dewey, and the WorldCat Entities APIs are not historical artifacts — they are infrastructure carrying millions of records right now, in production, at OCLC and at every national library that contributes to them. The Authority Arc is a guided tour of that infrastructure, with real API calls and real records where the APIs are open, and curated captures of real records where they are not.

This is **not** a museum of historical cataloging practice. It is not a critique of OCLC or of authority control. It is a walking tour, in the present tense, of how a particular set of public APIs carry a particular discipline forward — and an honest accounting of where that discipline still has open problems worth working on.

---

## The Five Stages

### 01 — Identify

Identifier resolution across source authorities. The visitor pastes any persistent identifier — LC, DNB, BNF, Wikidata, ISNI, FAST, OCLC — and watches a real-time VIAF lookup return the canonical cluster URI, the preferred heading, and every other identifier VIAF knows about for the same entity. State is URL-addressable so any resolved record is a shareable link. The first visit is server-seeded with a fixture so the page is never blank.

- **Live**: VIAF source-ID lookup (`/api/resolve`)
- **Curated**: bundled offline fixture for Stephen King
- **Demonstrated**: provenance pill (live VIAF vs. fixture fallback), copy buttons for canonical URI and identifier, annotations on URI / curator / `entityMd5`, raw request-and-response on the wire

### 02 — Distinguish

When two records look alike, decide whether they describe the same person. When they look different, decide whether they still might. Live VIAF AutoSuggest typeahead with debounced fetch, ARIA combobox semantics, and keyboard navigation. Two curated **vote-then-reveal** cases:

- **Twain / Clemens** — pseudonym merge with the actual evidence catalogers cite
- **Two different "John Smith"s** — split, with non-overlapping life dates and distinct fields

Plus a field-guide catalog naming the six recurring shapes of disagreement: pseudonym link, transliteration variant, contested dates, posthumous merge, posthumous split, anonymous attribution.

- **Live**: VIAF AutoSuggest (`/api/autosuggest`)
- **Curated**: vote-reveal cases summarized from real LC + VIAF entries

### 03 — Classify

One real book (King's *It*, 1986) classified both ways:

- **Dewey** — hierarchical, one number, one path. Interactive tree from `800` (Literature) → `813.54` (American fiction 1945–1999), with editorial notes on why each level of the hierarchy exists.
- **FAST** — faceted, many access points, an intersection. Headings grouped by facet (Topical, Geographic, Chronological, Form/Genre), each with a per-heading note on what that access point asserts.

The side-by-side teaches tree vs. graph as epistemologies, not just formats.

### 04 — Connect

One entity's neighborhood rendered as **labeled edge-type blocks**, not a generic force-directed graph. Five edge categories with per-type editorial on what the relationship asserts and why graphs are sparse or dense at each:

- **Notable works** (Wikidata `P800`)
- **Influenced by** (Wikidata `P737`)
- **Contemporaries** (curated, since there is no single property for "contemporary")
- **Subject of** (Wikidata `P921` reverse-link — works *about* this person)
- **Subjects in common** (curated FAST topical overlap)

The page ends with a sparsity note: knowledge graphs are dense where editors have invested and sparse elsewhere — sparsity is a signal of *who has been studied*, not a flaw of the technology.

### 05 — Maintain

A curated forty-five-year **stewardship ledger** for one real authority cluster: record creation (1979), pseudonym link (Bachman, 1985), parallel national-authority records (1992), VIAF cluster formation (2003), Wikidata downstream consumption (2012), normalization, distinguishing against a same-name author, present-day estate-attested edges. Each entry expands to the editorial note on why that kind of change matters.

Then the harder question: **what would a verifiable trust layer over this stewardship require?** Three pillars:

1. **Signed change manifests** — every committed change signed by the cataloger's institution (proposal)
2. **Merkle-rooted history** — the ledger committed to a Merkle tree so any entry's inclusion is provable against a published root (**demonstrated on this page**: a Merkle root is computed at build time over the canonical serialization of every ledger entry, each entry carries its sibling-hash inclusion proof, and the browser re-verifies via SubtleCrypto on click)
3. **Replicated commitments** — Merkle roots co-signed and replicated across peer authorities (proposal)

The federated piece is the proposal. The Merkle half runs over Authority Arc's own curated ledger as a working demonstration.

---

## Architecture

```
authority-arc/
├── app/
│   ├── layout.tsx                    ← root layout, fonts, strip nav, site dedication
│   ├── page.tsx                      ← arc landing
│   ├── opengraph-image.tsx           ← landing OG (1200×630, Fraunces, museum aesthetic)
│   ├── identify/                     ← Stage 01
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── disambiguate/                 ← Stage 02
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── classify/                     ← Stage 03
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── connect/                      ← Stage 04
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── maintain/                     ← Stage 05
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── globals.css
│   └── api/
│       ├── resolve/route.ts          ← (curator, id) → ResolvedEntity (VIAF + fixture fallback)
│       ├── autosuggest/route.ts      ← VIAF AutoSuggest proxy
│       └── curator/[code]/route.ts   ← curator metadata lookup
├── components/
│   ├── shared/
│   │   ├── strip-nav.tsx             ← top-of-page stage indicator
│   │   ├── stage-page.tsx            ← StagePage / Exhibit / ContinueCallout / HonestCapability
│   │   └── stage-stub.tsx            ← shared chrome for any future in-preparation stage
│   ├── stage1/                       ← wall-of-identifiers, resolver, honest-capability
│   ├── stage2/                       ← autosuggest, vote-reveal, disagreement-types
│   ├── stage3/                       ← dewey-tree, fast-facets
│   ├── stage4/                       ← neighborhood (labeled edge-type blocks)
│   └── stage5/                       ← ledger (with Merkle root + per-entry inclusion proofs)
├── lib/
│   ├── types.ts                      ← ResolvedEntity, AutoSuggestResponse, etc.
│   ├── viaf.ts                       ← viafLookup + viafAutoSuggest
│   ├── fixtures.ts                   ← Stage 1 fixture loader
│   ├── curators.ts                   ← curator registry (LC, DNB, BNF, …)
│   ├── disambiguation-cases.ts       ← Stage 2 vote-reveal cases
│   ├── classify-records.ts           ← Stage 3 Dewey + FAST records
│   ├── connect-records.ts            ← Stage 4 neighborhood records
│   ├── maintain-records.ts           ← Stage 5 ledger + merkleizeRecord()
│   ├── merkle.ts                     ← SHA-256 Merkle tree builder (server-only)
│   └── og-template.tsx               ← shared OpenGraph image renderer
├── data/
│   └── fixtures/
│       ├── king-stephen.json         ← Stage 1
│       ├── disambiguation/           ← Stage 2 (twain-clemens, two-john-smiths)
│       ├── classify/                 ← Stage 3 (it-by-king)
│       ├── connect/                  ← Stage 4 (stephen-king neighborhood)
│       └── maintain/                 ← Stage 5 (king-ledger)
├── tests/                            ← Vitest + @testing-library/react
└── docs/                             ← THREAT_MODEL, HONEST_CAPABILITY, SOURCES
```

The entire site is **Next.js 14 (App Router) + TypeScript + Tailwind**, hosted on Vercel.

---

## Design System

| Element | Value |
|---------|-------|
| **Aesthetic** | Museum placard / archival paper |
| **Display** | Fraunces (serif, optical sizing + SOFT/WONK axes) |
| **Body** | Inter |
| **Code & data** | JetBrains Mono |
| **Background** | `#f3eee4` (paper) with warm radial gradients + SVG paper grain |
| **Ink** | `#1a1a24` headings, `#3a3a48` body, `#5a5a68` labels |
| **Accents** | `#6e1f1f` (oxblood), `#1f3a6e` (indigo), `#a8762a` (ochre) / `#7a5215` (ochre-deep) |
| **Rule** | `#c9bfa5` |

Every color and font is encoded as a Tailwind theme token in `tailwind.config.ts`. New tokens go there, not as inline hex values.

### Accessibility

- WCAG 2.1 AA contrast ratios on all body text (verified after token darkening: ochre-deep replaces ochre for small text; ink-faint at `#5a5a68` passes on paper-deep)
- Skip-to-content link in the root layout
- Keyboard-navigable resolvers, annotations, autosuggest combobox, and stage nav
- `aria-current="page"` on the active stage link
- `aria-busy` on the resolver form during requests; `role="status" aria-live="polite"` for outcome announcements
- Focus restoration to the trigger button when an annotation closes
- 44px minimum touch targets on primary interactive elements (`.tap-target`)
- `prefers-reduced-motion` collapses every animation
- Honest fallback states for network failure, rendered as data not hidden

---

## Honest Capability

This project follows the discipline of naming what each page *actually* does, what it *implies but does not prove*, and where it *takes narrative liberties for clarity*. Every stage page carries its own three-column Honest Capability section; cumulative notes live in [`docs/HONEST_CAPABILITY.md`](./docs/HONEST_CAPABILITY.md).

---

## Local Development

```bash
# Install
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). VIAF is free and requires no key, so the resolver and AutoSuggest work end-to-end out of the box.

```bash
# Type-check + lint + test
npm run typecheck
npm run lint
npm test

# Build for production
npm run build
npm start
```

### Optional: OCLC WorldCat Entity Data enrichment

The resolver can attach a WorldCat entity URI and content fingerprint to any VIAF-resolved record. This is gravy, not a hard dependency — if OCLC is unreachable or has no matching entity, the resolver returns the VIAF result unchanged.

Set the following in `.env.local`:

```env
OCLC_CLIENT_ID=...
OCLC_CLIENT_SECRET=...
OCLC_TOKEN_URL=https://oauth.oclc.org/token
# Optional override; the default below is the correct production host.
OCLC_ENTITY_BASE_URL=https://id.oclc.org/worldcat
OCLC_SCOPES="publicEntities:read_brief_entities publicEntities:read_references"
```

The WSKey only needs the two `publicEntities:*` scopes — both are free-tier and available to any institution without an OCLC Meridian subscription.

**How the bridge works.** OCLC's `GET /entity/{id}` endpoint takes an OCLC entity ID in the path, not a VIAF id, and the API that would resolve `viaf → entity-id` (PID Lookup) is paywalled behind Meridian. To stay on the free tier, `lib/oclc.ts` bridges through public data instead:

```
VIAF id ──Wikidata SPARQL: ?item wdt:P214 "<viaf>"; wdt:P10832 ?ocl ──▶ OCLC entity ID
                                                                            │
                                                                            ▼
                            GET https://id.oclc.org/worldcat/entity/{id}    (publicEntities scope)
                                                                            │
                                                                            ▼
                                                        WorldCat URI + ETag attached to record
```

Wikidata's `P10832` ("WorldCat Entities ID") is the join key; the SPARQL hop is unauthenticated and rate-limit-friendly. Coverage is uneven — well-known entities resolve, more obscure ones silently fall through to the unenriched VIAF record, which is the intended best-effort behavior.

A diagnostic endpoint exposes each step:

```bash
# Walk the full bridge end-to-end
curl 'http://localhost:3000/api/oclc-debug?viaf=27066711'

# Skip the bridge, hit /entity/{id} directly
curl 'http://localhost:3000/api/oclc-debug?id=E39PBJcGmbT4qdMwCHRrCypHG3'
```

---

## Testing

Vitest + `@testing-library/react` + `happy-dom`.

```bash
npm test                  # full suite
npm run test:watch        # watch mode
npm run test:coverage     # with v8 coverage report
```

Test surface includes:

- **`lib/viaf.ts`** — URL construction, JSON normalization, error mapping; `viafAutoSuggest` response parsing
- **`lib/fixtures.ts`** — match by primary query and by sameAs entry, case insensitivity
- **`lib/disambiguation-cases.ts` / `classify-records.ts` / `connect-records.ts` / `maintain-records.ts`** — loaders return well-formed records and the right cases
- **`lib/merkle.ts`** — tree construction, root determinism, per-leaf inclusion-proof verification (with tampering tests)
- **`/api/resolve`** — request validation, VIAF success path, VIAF failure → fixture fallback, fixture-only mode
- **Stage 1 components** — resolver renders, chips fire requests, annotations open and close

---

## Deployment

Configured for Vercel. Push to `main` builds and deploys.

```bash
# Optional: deploy manually
npx vercel --prod
```

Current production URL: **https://authority-arc.vercel.app**.

The `CNAME` file points `authorityarc.systemslibrarian.dev` at the deployment. To wire the custom domain: add the domain in the Vercel dashboard (Project → Settings → Domains) and add the CNAME record at the DNS registrar pointing to `cname.vercel-dns.com`.

---

## Data Attribution

VIAF data is provided under the **Open Data Commons Attribution License (ODC-BY)**. Per the license, attribution to OCLC and VIAF appears on every page that displays VIAF-sourced data and in `docs/SOURCES.md`.

Wikidata content used in Stage 4 is available under **CC0** with attribution requested to Wikidata Editors.

This project is **not affiliated with OCLC.** It is an independent educational work that uses OCLC and VIAF public APIs.

---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See [LICENSE](./LICENSE) for the full text.

---

## Mission

The Authority Arc exists to make the half-century of work that catalogers, reference librarians, and authority-control specialists have done on identity *visible to the people who keep reinventing it from scratch.*

The work is not glamorous. It is exact. It deserves to be understood.

---

<p align="center">
  <em>"Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God."</em><br />
  — 1 Corinthians 10:31
</p>
