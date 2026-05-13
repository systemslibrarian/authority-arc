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
  // Try multiple hostnames — the WorldCat Entities API has lived under several
  // domains over its lifetime and the docs are inconsistent. Whichever one
  // returns a non-network error tells us the right base.
  const hosts = [
    "https://entity.api.oclc.org",
    "https://entities.api.oclc.org",
    "https://americas.metadata.api.oclc.org",
    "https://americas.discovery.api.oclc.org",
  ];
  const attempts: { label: string; url: string }[] = [];
  for (const h of hosts) {
    attempts.push({ label: `${h} root`, url: `${h}/` });
    attempts.push({
      label: `${h} /data/person?q=viafID`,
      url: `${h}/data/person?q=${encodeURIComponent(`viafID:${viaf}`)}&limit=1`,
    });
  }

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
