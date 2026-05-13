import { NextRequest, NextResponse } from "next/server";
import { getOclcAccessToken, oclcConfigured } from "@/lib/oclc";

/**
 * GET /api/oclc-debug?viaf=27066711
 *
 * TEMPORARY diagnostic endpoint. Walks the OCLC integration step-by-step
 * and returns whatever upstream actually said, so we can see why the silent
 * enrichment path is returning nothing. Delete this route once the
 * integration is verified.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const viaf = req.nextUrl.searchParams.get("viaf") ?? "27066711";
  const out: Record<string, unknown> = {
    configured: oclcConfigured(),
    env: {
      tokenUrl: process.env.OCLC_TOKEN_URL ?? null,
      entitiesBase: process.env.OCLC_ENTITIES_BASE_URL ?? null,
      scopes: process.env.OCLC_SCOPES ?? null,
      hasClientId: Boolean(process.env.OCLC_CLIENT_ID),
      hasClientSecret: Boolean(process.env.OCLC_CLIENT_SECRET),
    },
  };

  let token: string;
  try {
    token = await getOclcAccessToken();
    out.tokenAcquired = true;
    out.tokenPreview = `${token.slice(0, 8)}…${token.slice(-4)}`;
  } catch (err: any) {
    out.tokenAcquired = false;
    out.tokenError = String(err?.message ?? err);
    return NextResponse.json(out, { status: 200 });
  }

  // Try several plausible endpoint shapes — WorldCat Entities has shipped
  // under multiple paths over its lifetime. We hit each and report what
  // came back so we can see which one the WSKey actually has access to.
  const base = "https://entities.api.oclc.org";
  const paths = [
    "/entities",
    "/entities/person",
    `/entities/person?q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    `/entities/person?q=${encodeURIComponent(`inScheme:viaf AND identifier:${viaf}`)}&limit=1`,
    `/entities?type=person&q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    "/v1/entities",
    `/v1/entities/person?q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    "/data/entity",
    "/data/entity/person",
    `/data/entity/person?q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    "/searchEntity",
    `/searchEntity?type=person&q=${encodeURIComponent(`viafID:${viaf}`)}`,
    "/wcentities",
    `/wcentities/person?q=${encodeURIComponent(`viafID:${viaf}`)}`,
    "/meridian",
    "/meridian/person",
  ];
  const attempts: { label: string; url: string }[] = paths.map((p) => ({
    label: p,
    url: `${base}${p}`,
  }));

  const results: any[] = [];
  for (const a of attempts) {
    try {
      const r = await fetch(a.url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      const text = await r.text();
      results.push({
        label: a.label,
        url: a.url,
        status: r.status,
        body: text.slice(0, 600),
      });
    } catch (err: any) {
      results.push({
        label: a.label,
        url: a.url,
        error: String(err?.message ?? err),
      });
    }
  }
  out.attempts = results;
  return NextResponse.json(out, { status: 200 });
}
