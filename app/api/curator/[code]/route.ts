import { NextRequest, NextResponse } from "next/server";
import { lookupCurator } from "@/lib/curators";

/**
 * GET /api/curator/[code]
 *
 * Returns metadata about a single curator (national authority / OCLC body).
 * Used by the Stage 1 curator-detail popover.
 *
 * 404 if the code is not in our registry. Adding a new curator is one entry
 * in lib/curators.ts — there is no remote lookup involved.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
): Promise<NextResponse> {
  const info = lookupCurator(params.code);
  if (!info) {
    return NextResponse.json(
      {
        error: true,
        status: 404,
        code: "NOT_FOUND",
        message: `Curator code "${params.code}" is not in the registry.`,
      },
      { status: 404 }
    );
  }
  return NextResponse.json(info);
}
