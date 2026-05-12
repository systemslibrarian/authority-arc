import { NextRequest, NextResponse } from "next/server";
import { wikidataNeighborhood } from "@/lib/wikidata";
import { listConnectRecords } from "@/lib/connect-records";
import type { ResolveError } from "@/lib/types";

/**
 * GET /api/connect?wikidata=Qxxx
 *
 * Returns a ConnectRecord-shaped neighborhood for the given Wikidata Q-id.
 *
 * Resolution order:
 *   1. If a curated fixture exists for the entity (by Wikidata id), serve
 *      it. The curated record carries five relationship blocks including
 *      contemporaries and shared subjects, which are not directly
 *      queryable as Wikidata predicates.
 *   2. Otherwise, hit Wikidata SPARQL live and normalize the response.
 *      Live mode returns three relationship blocks (notable works,
 *      influenced by, subject of) — fewer than the curated path, by
 *      design.
 *
 * When SPARQL is unreachable, the route returns an UPSTREAM_ERROR — no
 * fixture fallback for arbitrary entities, because we have no fixture for
 * arbitrary entities. The page surfaces the failure as data, the way
 * Stage 1 does for VIAF.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("wikidata") ?? "";
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) {
    return errorResponse({
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "wikidata query parameter is required (e.g. Q39829).",
    });
  }
  if (!/^Q\d+$/.test(trimmed)) {
    return errorResponse({
      error: true,
      status: 400,
      code: "BAD_INPUT",
      message: "wikidata must be a Q-identifier (Q followed by digits).",
    });
  }

  // Prefer curated fixtures for entities we have one for.
  const curated = listConnectRecords().find(
    (r) => r.entity.wikidata.toUpperCase() === trimmed
  );
  if (curated) {
    return NextResponse.json(curated);
  }

  try {
    const data = await wikidataNeighborhood(trimmed);
    return NextResponse.json(data);
  } catch (err: any) {
    return errorResponse({
      error: true,
      status: err?.status ?? 502,
      code: err?.code ?? "UPSTREAM_ERROR",
      message:
        typeof err?.message === "string"
          ? err.message
          : "Wikidata SPARQL unreachable.",
    });
  }
}

function errorResponse(err: ResolveError): NextResponse {
  return NextResponse.json(err, { status: err.status });
}
