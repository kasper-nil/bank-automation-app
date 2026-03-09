import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { SparebankToken } from "@/lib/api/sparebank/token.server";

const COOKIE_NAME = "sparebank_token";

function isExpired(token: SparebankToken): boolean {
  return Date.now() > token.issued_at + token.expires_in * 1000;
}

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let token: SparebankToken;
  try {
    token = JSON.parse(decodeURIComponent(raw)) as SparebankToken;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!isExpired(token)) {
    return NextResponse.json({ access_token: token.access_token });
  }

  // Token is expired — refresh it
  const body = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
    client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
    refresh_token: token.refresh_token,
    grant_type: "refresh_token",
  });

  const refreshResponse = await fetch("https://api.sparebank1.no/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!refreshResponse.ok) {
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 401 },
    );
  }

  const newTokenData = await refreshResponse.json();
  const newToken: SparebankToken = { ...newTokenData, issued_at: Date.now() };
  const cookieValue = encodeURIComponent(JSON.stringify(newToken));

  const response = NextResponse.json({ access_token: newToken.access_token });
  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 365 days — matches refresh_token lifetime
    sameSite: "lax",
  });

  return response;
}
