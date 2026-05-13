import { NextRequest, NextResponse } from "next/server";
import { viafLookup } from "@/lib/viaf";
import { oclcEnrich } from "@/lib/oclc";
import { fixtureLookup } from "@/lib/fixtures";
import type { ResolveError, ResolvedEntity } from "@/lib/types";

/**
 * POST /api/resolve
 *
 * Request body:
 *   { curator: string, id: string, prefer?: "viaf" | "fixture" }
 *
 * Resolution order (default):
 *   1. VIAF live call
 *   2. Bundled fixture (if VIAF is unreachable or returns 404 for a known fixture)
 *
 * When `prefer: "fixture"` is set, skip VIAF entirely. This is useful for
 * deterministic demos and for the test suite.
 *
 * Response: ResolvedEntity (200) or ResolveError (4xx/5xx).
 *
 * The route is intentionally simple — it does no rate limiting in v1 because
 * VIAF is free and our request volume is bounded by the small number of demo
 * cards. If/when this is opened up to user-typed lookups at scale, the rate
 * limiter belongs in middleware.ts.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse({
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "Request body must be valid JSON.",
    });
  }

  const parsed = parseRequest(body);
  if ("error" in parsed) return errorResponse(parsed);

  const { curator, id, prefer } = parsed;

  // Fixture-only mode (tests, deterministic demos).
  if (prefer === "fixture") {
    const fixture = fixtureLookup({ curator, id });
    if (fixture) {
      const enriched = await oclcEnrich(fixture);
      return NextResponse.json(enriched satisfies ResolvedEntity);
    }
    return errorResponse({
      error: true,
      status: 404,
      code: "NOT_FOUND",
      message: `No fixture matches ${curator}|${id}.`,
    });
  }

  // Default: VIAF live, fixture fallback. WorldCat Entities runs as a
  // best-effort enrichment on top of the VIAF result; failures there are
  // swallowed inside oclcEnrich and never poison the response.
  try {
    const resolved = await viafLookup({ curator, id });
    const enriched = await oclcEnrich(resolved);
    return NextResponse.json(enriched);
  } catch (err: any) {
    // 404 from VIAF → try fixtures before giving up.
    if (err?.code === "NOT_FOUND") {
      const fixture = fixtureLookup({ curator, id });
      if (fixture) {
        const enriched = await oclcEnrich(fixture);
        return NextResponse.json(enriched satisfies ResolvedEntity);
      }
      return errorResponse({
        error: true,
        status: 404,
        code: "NOT_FOUND",
        message: `Neither VIAF nor bundled fixtures contain ${curator}|${id}.`,
      });
    }
    // Upstream failure or timeout → also try fixtures.
    const fixture = fixtureLookup({ curator, id });
    if (fixture) {
      const enriched = await oclcEnrich(fixture);
      return NextResponse.json(enriched satisfies ResolvedEntity);
    }
    return errorResponse({
      error: true,
      status: 502,
      code: "UPSTREAM_ERROR",
      message: `VIAF unreachable (${err?.message ?? "unknown error"}); no fixture fallback available.`,
    });
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

type ParsedRequest =
  | { curator: string; id: string; prefer?: "viaf" | "fixture" }
  | ResolveError;

function parseRequest(body: unknown): ParsedRequest {
  if (!body || typeof body !== "object") {
    return {
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "Body must be an object with `curator` and `id`.",
    };
  }
  const b = body as Record<string, unknown>;
  const curator = typeof b.curator === "string" ? b.curator.trim() : "";
  const id = typeof b.id === "string" ? b.id.trim() : "";
  if (!curator) {
    return { error: true, status: 400, code: "BAD_INPUT", message: "`curator` is required." };
  }
  if (!id) {
    return { error: true, status: 400, code: "BAD_INPUT", message: "`id` is required." };
  }
  if (curator.length > 32 || id.length > 256) {
    return {
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "Inputs exceed maximum length.",
    };
  }
  const prefer = b.prefer === "fixture" || b.prefer === "viaf" ? b.prefer : undefined;
  return { curator, id, prefer };
}

function errorResponse(err: ResolveError): NextResponse {
  return NextResponse.json(err, { status: err.status });
}
