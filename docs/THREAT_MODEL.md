# Threat Model

The Authority Arc is a read-only educational site. The threat model is correspondingly modest, but worth naming explicitly so it can be revisited as features grow.

## What we are protecting

**Server-side OCLC credentials** when the OCLC PID Lookup integration is enabled.
**Site integrity** — the page should never render data that the upstream API did not return.
**The honesty of the Honest Capability section** — visitors should be able to trust that what is named demonstrated is actually demonstrated.

## What we are explicitly not protecting

- Visitor identity — there is none. No accounts, no analytics that identify individuals.
- Visitor inputs — the resolver accepts a `(curator, id)` pair. We do not consider these sensitive.
- VIAF or OCLC infrastructure — we are a consumer of these services, not a guardian of them.

## Trust boundaries

```
   ┌─────────────────────────────┐
   │  Visitor browser            │
   │  (untrusted)                │
   └──────────────┬──────────────┘
                  │
                  ▼  HTTPS
   ┌─────────────────────────────┐
   │  Vercel edge / Next.js      │
   │  /api/resolve               │ ← env-var credentials live here
   │  (trusted)                  │
   └──────────────┬──────────────┘
                  │
                  ▼  HTTPS
   ┌─────────────────────────────┐
   │  VIAF (free, no auth)       │
   │  OCLC PID Lookup (OAuth2)   │
   │  (upstream, trusted-on-faith)│
   └─────────────────────────────┘
```

## Specific threats considered

| Threat | Mitigation |
|--------|------------|
| OCLC client secret leaks to the browser | Credentials live as Vercel environment variables; `/api/resolve` is the only code path that reads them. None are referenced in client-side bundles. |
| Malformed visitor input causes server crash | All inputs validated in `parseRequest`; length-limited; bad input returns 400 with `BAD_INPUT`. |
| VIAF or OCLC returns malformed JSON | `lib/viaf.ts` normalizes defensively — missing fields render as undefined rather than throw. |
| Upstream timeout takes the page down | `AbortSignal.timeout(10_000)`; on failure, the route falls back to bundled fixtures with the source labeled accordingly. |
| Rate limit from VIAF | Aggressive caching planned; in v1 the demo is bounded by a small set of fixtures and a starter-chip set. |
| Cross-site scripting via curator labels or IDs | All values rendered through React's default escaping; no `dangerouslySetInnerHTML`. |
| Injected upstream content forging an entity | Out of scope — we trust VIAF and OCLC as data sources. If you find a way to forge this trust externally, see SECURITY.md. |

## What changes when Meridian access lands

- Credentials in `.env.local` (dev) and Vercel env vars (prod).
- OAuth2 client_credentials token cached in process memory; refreshed before expiry.
- `entityMd5` and OCLC Entity URI begin populating on resolver responses.
- The Honest Capability columns for Stage 1 are updated to reflect the new live data.

## What changes for Stage 5

Stage 5 (Maintain) is where this document grows. It introduces the question of *cryptographically verifiable* authority data — signed change manifests, Merkle audit logs, HMAC-chained sync receipts — and a new trust boundary between "OCLC says the record changed" and "we can verify the record changed without re-asking OCLC."

When Stage 5 ships, this document will gain a Stage 5 section describing the additional trust relationships, the new keys involved, and the failure modes the trust layer is designed to catch.
