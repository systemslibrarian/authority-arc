# Contributing to The Authority Arc

Thanks for considering a contribution. This document keeps things short.

## Ground rules

1. **The Honest Capability section is part of every stage page.** Any change to what a page demonstrates must be reflected in the demonstrated / aspirational / faked columns. A page where Honest Capability is out of date is a bug.

2. **VIAF and OCLC attribution is non-negotiable.** Every page that renders VIAF-sourced data attributes VIAF and OCLC. Every commit that adds a new data source updates `docs/SOURCES.md`.

3. **Threat model first, code second.** For changes that introduce new authentication, secret handling, or upstream API surface, open an issue describing the threat model before opening the PR. See `docs/THREAT_MODEL.md` for the existing model.

4. **Failure cases render as data, not as silence.** A timeout from VIAF is a teachable moment, not a stack trace and a blank screen. If you add a new API path, add a corresponding failure-state UI.

## Setup

```bash
git clone https://github.com/systemslibrarian/authority-arc
cd authority-arc
npm install
npm run dev
```

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm test
```

All three must pass. CI will run them again.

## Commit messages

Scoped, imperative, lowercase prefix. Examples from the existing history:

- `fix(viaf): handle source records with no mainHeading`
- `feat(stage-2): autosuggest endpoint integration`
- `docs(threat-model): clarify trust boundary on /api/resolve`
- `chore(deps): bump next to 14.2.36 (security)`

## Reporting issues

- **Bugs and feature ideas**: open a GitHub issue.
- **Security concerns**: see `SECURITY.md`.

## Style of the prose

The project is written in a museum-placard voice — patient, curious, reverent of the people who built these systems. We don't dunk on OCLC, we don't dunk on VIAF, and we don't pretend the public APIs are perfect. We tell the truth about all three.
