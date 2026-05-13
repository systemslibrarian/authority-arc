import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/callback
 *
 * OAuth 2.0 Authorization Code + PKCE callback for the OCLC WSKey.
 *
 * Flow recap (the initiator lives wherever the "Sign in with OCLC" link is
 * eventually wired — not in this PR):
 *
 *   1. Client generates a random `code_verifier`, derives
 *      `code_challenge = base64url(sha256(verifier))`, and a random `state`.
 *   2. Client stores both in HttpOnly cookies and redirects the user to
 *      `${OCLC_AUTHORIZE_URL}?response_type=code&client_id=…&redirect_uri=…
 *      &state=…&code_challenge=…&code_challenge_method=S256&scope=…`.
 *   3. OCLC redirects back here with `?code=…&state=…`.
 *   4. We verify the state, exchange the code (plus the stored verifier) at
 *      the token endpoint, and stash the resulting access_token in a
 *      short-lived HttpOnly cookie before redirecting to "/".
 *
 * The current site has no UI that triggers step 2 — the WSKey's primary
 * use is server-side via the Client Credentials Grant in lib/oclc.ts. This
 * route exists so that the redirect URI registered with OCLC
 * (https://authority-arc.vercel.app/api/auth/callback) resolves correctly,
 * and so that wiring a future "Sign in" button is a one-file change.
 */

const TOKEN_URL = process.env.OCLC_TOKEN_URL ?? "https://oauth.oclc.org/token";
const REDIRECT_URI =
  process.env.OCLC_REDIRECT_URI ??
  "https://authority-arc.vercel.app/api/auth/callback";

const STATE_COOKIE = "oclc_oauth_state";
const VERIFIER_COOKIE = "oclc_pkce_verifier";
const TOKEN_COOKIE = "oclc_access_token";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: true, code: "OAUTH_ERROR", message: error },
      { status: 400 }
    );
  }
  if (!code || !state) {
    return NextResponse.json(
      { error: true, code: "BAD_INPUT", message: "Missing code or state." },
      { status: 400 }
    );
  }

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  const verifier = req.cookies.get(VERIFIER_COOKIE)?.value;
  if (!cookieState || !verifier) {
    return NextResponse.json(
      {
        error: true,
        code: "BAD_INPUT",
        message: "OAuth state missing — start the sign-in again.",
      },
      { status: 400 }
    );
  }
  // Constant-time-ish state comparison.
  if (cookieState.length !== state.length || cookieState !== state) {
    return NextResponse.json(
      { error: true, code: "BAD_STATE", message: "State mismatch." },
      { status: 400 }
    );
  }

  const clientId = process.env.OCLC_CLIENT_ID;
  const clientSecret = process.env.OCLC_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: true,
        code: "NOT_CONFIGURED",
        message: "OCLC client credentials not set on server.",
      },
      { status: 500 }
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
    client_id: clientId,
  });
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    return NextResponse.json(
      {
        error: true,
        code: "UPSTREAM_ERROR",
        message: `OCLC token exchange failed (${tokenRes.status}): ${text.slice(0, 200)}`,
      },
      { status: 502 }
    );
  }

  const json = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
  };
  if (!json.access_token) {
    return NextResponse.json(
      { error: true, code: "UPSTREAM_ERROR", message: "Token response missing access_token." },
      { status: 502 }
    );
  }

  const response = NextResponse.redirect(new URL("/", req.url));
  // Stash the access token as an HttpOnly cookie so the browser never sees it
  // and the server can read it on subsequent requests. Capped at the token's
  // declared lifetime (default 20 minutes if upstream omits it).
  response.cookies.set(TOKEN_COOKIE, json.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: json.expires_in ?? 1200,
  });
  // Clean up the one-shot PKCE/state cookies.
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}
