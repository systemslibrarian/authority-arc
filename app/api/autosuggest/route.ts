import { NextRequest, NextResponse } from "next/server";
import { viafAutoSuggest } from "@/lib/viaf";
import type { AutoSuggestResponse, ResolveError } from "@/lib/types";

/**
 * GET /api/autosuggest?q=<query>
 *
 * Live proxy to VIAF's AutoSuggest endpoint, normalized to AutoSuggestResponse.
 * Used by the Stage 2 typeahead.
 *
 * No fixture fallback here — the typeahead is fine returning an empty array
 * when VIAF is unreachable; we surface the error so the UI can show a quiet
 * "VIAF unreachable" state rather than pretending nothing is wrong.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const trimmed = q.trim();
  if (!trimmed) {
    return NextResponse.json({
      query: "",
      hits: [],
      wire: {
        requestUrl: "",
        responseStatus: 200,
        fetchedAt: new Date().toISOString(),
      },
    } satisfies AutoSuggestResponse);
  }
  if (trimmed.length > 128) {
    return errorResponse({
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "Query exceeds maximum length.",
    });
  }
  try {
    const data = await viafAutoSuggest(trimmed);
    return NextResponse.json(data satisfies AutoSuggestResponse);
  } catch (err: any) {
    return errorResponse({
      error: true,
      status: err?.status ?? 502,
      code: err?.code ?? "UPSTREAM_ERROR",
      message:
        typeof err?.message === "string"
          ? err.message
          : "VIAF AutoSuggest unreachable.",
    });
  }
}

function errorResponse(err: ResolveError): NextResponse {
  return NextResponse.json(err, { status: err.status });
}
