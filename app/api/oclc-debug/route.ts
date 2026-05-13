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
  const base = process.env.OCLC_ENTITIES_BASE_URL ?? "https://entity.api.oclc.org";
  const attempts = [
    {
      label: "person?q=viafID:N",
      url: `${base}/data/person?q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    },
    {
      label: "person?q=identifier",
      url: `${base}/data/person?q=${encodeURIComponent(
        `identifiers:"http://viaf.org/viaf/${viaf}"`
      )}&limit=1`,
    },
    {
      label: "person/search?viafID",
      url: `${base}/data/person/search?viafID=${encodeURIComponent(viaf)}&limit=1`,
    },
    {
      label: "browse?q=viafID",
      url: `${base}/data/person/browse?q=${encodeURIComponent(`viafID:${viaf}`)}`,
    },
    {
      label: "root catalog probe",
      url: `${base}/data`,
    },
  ];

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
