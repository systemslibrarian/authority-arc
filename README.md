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

> *"He determines the number of the stars; he gives to all of them their names."*
> — **Psalm 147:4 (ESV)**

Every digital object has many names. The work of keeping those names in agreement — of deciding when two strings refer to the same thing and when they do not — is one of the foundational hard problems in computing. Catalogers and reference librarians have been doing it, publicly and at scale, since the nineteen-sixties.

The Authority Arc is a walking tour of how. Five stages, each built around a different family of OCLC and VIAF APIs:

| # | Stage | The Question | Status |
|---|-------|--------------|--------|
| 01 | **Identify** | *What is this thing, really?* | ✅ Live |
| 02 | **Disambiguate** | *Which Stephen King?* | 🔜 In preparation |
| 03 | **Classify** | *Where does it sit in human knowledge?* | 🔜 In preparation |
| 04 | **Connect** | *What does it touch?* | 🔜 In preparation |
| 05 | **Maintain** | *How does it stay true over time?* | 🔜 In preparation |

---

## Quick Links

<p align="center">
  🌐 <a href="https://authorityarc.systemslibrarian.dev">Live Site</a> &nbsp;|&nbsp;
  🏛️ <a href="https://authorityarc.systemslibrarian.dev/identify">Stage 01 — Identify</a> &nbsp;|&nbsp;
  📜 <a href="./docs/THREAT_MODEL.md">Threat Model</a> &nbsp;|&nbsp;
  📚 <a href="./docs/SOURCES.md">Sources & Attribution</a>
</p>

---

## Why The Authority Arc Exists

Identity resolution is invisible to most software engineers. Auth0, Okta, and Wikidata-the-knowledge-graph all feel like recent inventions. They are not. The discipline that powers them — *this thing has many names; here is how we keep them in agreement; here is what we do when they disagree* — has been carried out at scale, in the open, by national libraries and OCLC for over half a century.

The arc moves from *"Who is this?"* to *"How does the knowledge graph know?"* — and ends with the older, harder question of how that knowing is kept true over time. Cataloging is not clerical work. It is the ongoing **stewardship** of identity, meaning, relationships, and trust, performed daily by people whose job titles do not say *"persistent identifier engineer."*

The intended audience is:

- **Software engineers** who have built or maintained an identity-resolution system and want to see how the people who have been at it longest do it.
- **Library science students** who learn these concepts abstractly and have never touched the APIs that live underneath.
- **Linked-data and semantic-web practitioners** who keep rediscovering things VIAF and FAST have shipped for decades.
- **AI / ML people** working on entity disambiguation, knowledge graphs, and RAG systems who would benefit from a serious look at how this is done outside their immediate field.

The arc teaches one stage at a time, with a live, working demo at each.

## What this is, and what it isn't

This is **an interactive window into a living system.** VIAF, FAST, Dewey, and the WorldCat Entities APIs are not historical artifacts — they are infrastructure carrying millions of records right now, in production, at OCLC and at every national library that contributes to them. The Authority Arc is a guided tour of that infrastructure, with real API calls and real records, on every page.

This is **not** a museum of historical cataloging practice. It is not a survey of library science from the outside. It is not a critique of OCLC or of authority control. It is a walking tour, in the present tense, of how a particular set of public APIs carry a particular discipline forward — and an honest accounting of where that discipline still has open problems worth working on.

---

## Stage 01 — Identify (Live)

Stage 1 demonstrates **identifier resolution across source authorities**. The visitor can:

- See twenty-plus identifiers for Stephen King — LC, DNB, BNF, BNE, NDL, NLA, Wikidata, ISNI, FAST, and more — laid out as a wall of paper scraps connected by dashed lines to the named entity in the center.
- Paste any identifier into the resolver and watch a real-time call to VIAF return the canonical cluster URI, the preferred heading, and every other identifier in the cluster.
- Click on the curator or canonical URI to read annotations on what each one is and what its persistence guarantees actually rest on.
- Inspect the raw request and response on the wire — no faked data behind the curtain.
- Read the *Honest Capability* section that names exactly what the page demonstrates, what it implies but does not prove, and where it takes narrative liberties.

### What is rendered live

| Element | Source | Status |
|---------|--------|--------|
| Cluster URI, preferred heading, sameAs identifiers | VIAF `/viaf/sourceID/{C}|{id}` | ✅ Live |
| Curator metadata (label, country, MARC code, URI pattern) | `lib/curators.ts` (hand-curated) | ✅ Live |
| Failure cases (404, timeout, malformed input) | `/api/resolve` | ✅ Live, rendered as data |
| `entityMd5` content fingerprint | OCLC PID Lookup | ⏸ Awaiting Meridian access |
| OCLC canonical Entity URI | OCLC Entity Search | ⏸ Awaiting Meridian access |

---

## Architecture

```
authority-arc/
├── app/
│   ├── layout.tsx            ← root layout, fonts, strip nav
│   ├── page.tsx              ← arc landing
│   ├── identify/page.tsx     ← Stage 01 (live)
│   ├── disambiguate/page.tsx ← Stage 02 stub
│   ├── classify/page.tsx     ← Stage 03 stub
│   ├── connect/page.tsx      ← Stage 04 stub
│   ├── maintain/page.tsx     ← Stage 05 stub
│   ├── globals.css
│   └── api/
│       ├── resolve/route.ts        ← unified (curator, id) → ResolvedEntity
│       └── curator/[code]/route.ts ← curator metadata lookup
├── components/
│   ├── shared/
│   │   ├── strip-nav.tsx           ← top-of-page stage indicator
│   │   └── stage-stub.tsx          ← shared chrome for in-preparation stages
│   └── stage1/
│       ├── wall-of-identifiers.tsx ← Exhibit A
│       ├── resolver.tsx            ← Exhibit B + resolved card + annotations
│       └── honest-capability.tsx   ← demonstrated / aspirational / faked columns
├── lib/
│   ├── types.ts                    ← ResolvedEntity, ResolveError, CuratorInfo
│   ├── viaf.ts                     ← VIAF client + normalizer
│   ├── fixtures.ts                 ← offline-mode loader
│   └── curators.ts                 ← curator registry (LC, DNB, BNF, …)
├── data/
│   └── fixtures/
│       └── king-stephen.json       ← canonical fixture for the demo
├── tests/                          ← Vitest + @testing-library/react
└── docs/
    ├── THREAT_MODEL.md             ← what we protect against
    ├── HONEST_CAPABILITY.md        ← cumulative honest-capability across stages
    └── SOURCES.md                  ← attribution to VIAF, OCLC, etc.
```

The entire site is **Next.js 14 (App Router) + TypeScript + Tailwind**, hosted on Vercel. The `/api/resolve` route is a thin proxy: it accepts a `(curator, id)` pair, calls VIAF, normalizes the response into a stable `ResolvedEntity` shape, and returns it. If VIAF is unreachable, it falls back to bundled fixtures so the demo never goes fully dark.

---

## Design System

| Element | Value |
|---------|-------|
| **Aesthetic** | Museum placard / archival paper |
| **Display** | Fraunces (serif, optical sizing + SOFT/WONK axes) |
| **Body** | Inter |
| **Code & data** | JetBrains Mono |
| **Background** | `#f3eee4` (paper) with warm radial gradients + SVG paper grain |
| **Ink** | `#1a1a24` headings, `#3a3a48` body, `#6a6a78` labels |
| **Accents** | `#6e1f1f` (oxblood), `#1f3a6e` (indigo), `#a8762a` (ochre) |
| **Rule** | `#c9bfa5` |

Every color and font is encoded as a Tailwind theme token in `tailwind.config.ts`. New tokens go there, not as inline hex values.

### Accessibility

- WCAG AA contrast ratios on all body text
- Keyboard-navigable resolver, annotations, and stage navigation
- `aria-current` on the active stage link in the strip nav
- 44px minimum touch targets on interactive elements
- Reduced-motion friendly (the wall animation degrades to instant placement)
- Honest fallback states for network failure, rendered as data not hidden

---

## Honest Capability

This project follows the discipline of naming what each page *actually* does, what it *implies but does not prove*, and where it *takes narrative liberties for clarity*. The cumulative honest-capability ledger lives at [`docs/HONEST_CAPABILITY.md`](./docs/HONEST_CAPABILITY.md). A summary for v1:

**Demonstrated** — Real VIAF lookups against twelve+ source-authority schemes. Curator detail from a hand-curated registry. The full sameAs cluster for every fixture. Failure paths rendered as data.

**Aspirational** — That OCLC's persistence promise will outlive any one source authority. That cluster membership is a fact rather than a current best-effort consensus. That an MD5 fingerprint is integrity (it is change-detection, not tamper-evidence).

**Faked, with cause** — Two of the lines on the Stage 1 wall are drawn as "disagreement" for narrative effect; actual disagreement cases require the Entity Connections API. The OCLC Entity URI chit is a placeholder shape until Meridian access lands. The `entityMd5` field is empty on VIAF responses because VIAF does not publish a content hash — the annotation says so.

---

## Local Development

```bash
# Install
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). VIAF is free and requires no key, so the resolver works end-to-end out of the box.

```bash
# Type-check + lint + test
npm run typecheck
npm run lint
npm test

# Build for production
npm run build
npm start
```

### Optional: OCLC PID Lookup integration

When OCLC Meridian access is provisioned, set the following in `.env.local`:

```env
OCLC_CLIENT_ID=...
OCLC_CLIENT_SECRET=...
OCLC_TOKEN_URL=https://oauth.oclc.org/token
OCLC_ENTITIES_BASE_URL=https://entities.api.oclc.org
```

`/api/resolve` will then prefer OCLC PID Lookup over VIAF for entities OCLC knows about, and the `entityMd5` field will populate on the resolver card.

---

## Testing

Vitest + `@testing-library/react` + `happy-dom`, matching the Scripture Journey stack.

```bash
npm test                  # full suite
npm run test:watch        # watch mode
npm run test:coverage     # with v8 coverage report
```

The test suite covers:

- **`lib/viaf.ts`** — request URL construction, JSON normalization, error mapping for 404 / timeout / malformed cluster
- **`lib/fixtures.ts`** — match by primary query and by any sameAs entry, case insensitivity
- **`/api/resolve`** — request validation, VIAF success path, VIAF failure → fixture fallback, fixture-only mode for deterministic tests
- **Stage 1 components** — resolver renders, chips fire requests, annotations open and close
- **Strip nav** — current-stage `aria-current` correctness

---

## Deployment

Configured for Vercel. Push to `main` builds and deploys.

```bash
# Optional: deploy manually
npx vercel --prod
```

The `CNAME` in the repo root points `authorityarc.systemslibrarian.dev` at the Vercel deployment.

---

## Data Attribution

VIAF data is provided under the **Open Data Commons Attribution License (ODC-BY)**. Per the license, attribution to OCLC and VIAF appears on every page that displays VIAF-sourced data, on the resolver card under "source: viaf," and in `docs/SOURCES.md`.

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
  <em>Soli Deo Gloria</em>
</p>
