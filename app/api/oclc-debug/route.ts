import { NextRequest, NextResponse } from "next/server";
import {
  getOclcAccessToken,
  oclcConfigured,
  oclcFetchEntity,
  worldcatEntityIdFromViafViaWikidata,
} from "@/lib/oclc";

/**
 * GET /api/oclc-debug?viaf=27066711      walk the full VIAF -> WD -> OCLC chain
 * GET /api/oclc-debug?id=E39PBJcGmbT4qdMwCHRrCypHG3   skip the bridge, hit /entity/{id} directly
 *
 * Diagnostic endpoint. Our WSKey only carries the publicEntities scopes, which
 * means we can only call `GET https://id.oclc.org/worldcat/entity/{id}`. To go
 * from a VIAF id to an OCLC entity id we bridge via Wikidata's P10832
 * statement (free, no auth). This route exposes each step so we can see
 * exactly where the chain breaks when a record fails to enrich.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const viaf = req.nextUrl.searchParams.get("viaf");
  const directId = req.nextUrl.searchParams.get("id");

  const out: Record<string, unknown> = {
    configured: oclcConfigured(),
    env: {
      tokenUrl: process.env.OCLC_TOKEN_URL ?? null,
      entityBase: process.env.OCLC_ENTITY_BASE_URL ?? null,
      scopes: process.env.OCLC_SCOPES ?? null,
      hasClientId: Boolean(process.env.OCLC_CLIENT_ID),
      hasClientSecret: Boolean(process.env.OCLC_CLIENT_SECRET),
    },
    input: { viaf, id: directId },
  };

  try {
    const token = await getOclcAccessToken();
    out.tokenAcquired = true;
    out.tokenPreview = `${token.slice(0, 8)}…${token.slice(-4)}`;
  } catch (err: any) {
    out.tokenAcquired = false;
    out.tokenError = String(err?.message ?? err);
    return NextResponse.json(out, { status: 200 });
  }

  let oclcId = directId;

  if (!oclcId && viaf) {
    try {
      const bridge = await worldcatEntityIdFromViafViaWikidata(viaf);
      out.bridge = bridge ?? { found: false, note: "no Wikidata item with P214==viaf AND P10832 set" };
      oclcId = bridge?.worldcatEntityId ?? null;
    } catch (err: any) {
      out.bridge = { error: String(err?.message ?? err) };
    }
  }

  if (!oclcId) {
    if (!viaf && !directId) {
      out.error = "pass ?viaf=<viafID> or ?id=<oclc-entity-id>";
    }
    return NextResponse.json(out, { status: 200 });
  }

  try {
    const hit = await oclcFetchEntity(oclcId);
    out.entity = hit ?? { found: false, oclcId };
  } catch (err: any) {
    out.entity = { error: String(err?.message ?? err), oclcId };
  }

  return NextResponse.json(out, { status: 200 });
}
