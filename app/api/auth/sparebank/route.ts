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

  const html = `<!DOCTYPE html>
<html>
  <head><title>Authenticating...</title></head>
  <body>
    <script>
      localStorage.setItem("sparebank_token", JSON.stringify(${JSON.stringify(tokenWithTimestamp)}));
      window.location.replace("/dashboard");
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
