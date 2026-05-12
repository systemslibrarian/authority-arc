# Security Policy

The Authority Arc is a read-only educational website. It holds no user data, sets no user-identifying cookies, and accepts no user-uploaded content. The threat model is correspondingly modest.

That said, two things are worth taking seriously:

1. **Server-side credentials** — when OCLC PID Lookup is enabled, the `OCLC_CLIENT_ID` and `OCLC_CLIENT_SECRET` live as Vercel environment variables and never reach the client. The proxy at `/api/resolve` is the only code path that touches them.

2. **Upstream data integrity** — VIAF responses are not signed. We re-render what VIAF returns, on the assumption that the upstream channel is honest. If you find a way to inject false data into a rendered cluster, that's worth a report.

## Reporting a vulnerability

Email **paul@systemslibrarian.dev** with the subject line beginning `[security] authority-arc`. Please include:

- The page or endpoint affected
- A description of the vulnerability and its impact
- Steps to reproduce, ideally with a minimal proof of concept

I aim to acknowledge within 72 hours and remediate within 14 days for issues that are clearly impactful.

## Out of scope

- The intentional "two lines on the wall are oxblood" narrative effect on Stage 1 (documented in Honest Capability as faked-with-cause).
- Failure modes that the page already renders honestly (404, upstream timeout). These are features, not bugs.
- VIAF or OCLC vulnerabilities. Report those to OCLC.

## Supply chain

Dependencies are pinned in `package-lock.json`. The CI workflow runs `npm audit` on every push and fails on high/critical findings. Action SHAs are pinned in `.github/workflows/ci.yml` rather than version tags.
