import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return Response.json({ error: "Missing code" }, { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
    client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
    state: state!,
    redirect_uri: process.env.NEXT_PUBLIC_SPAREBANK_REDIRECT_URL!,
  });

  const tokenResponse = await fetch("https://api.sparebank1.no/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    return Response.json({ error }, { status: 502 });
  }

  const tokenData = await tokenResponse.json();
  const tokenWithTimestamp = { ...tokenData, issued_at: Date.now() };

  const cookieValue = JSON.stringify(tokenWithTimestamp);
  const maxAge = 365 * 24 * 60 * 60; // 365 days — matches refresh_token lifetime

  return new Response(null, {
    status: 307,
    headers: {
      Location: "/dashboard",
      "Set-Cookie": `sparebank_token=${encodeURIComponent(cookieValue)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    },
  });
}
