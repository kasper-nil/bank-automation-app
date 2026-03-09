import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return Response.json({ error: "Missing refresh_token" }, { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
    client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
    refresh_token,
    grant_type: "refresh_token",
  });

  const tokenResponse = await fetch("https://api.sparebank1.no/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    return Response.json(
      { error: `Token refresh failed: ${error}` },
      { status: 502 },
    );
  }

  const tokenData = await tokenResponse.json();
  return Response.json(tokenData);
}
