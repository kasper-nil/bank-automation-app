const BASE_URL = "https://api.sparebank1.no";

export function getAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
    state: process.env.NEXT_PUBLIC_SPAREBANK_STATE!,
    redirect_uri: process.env.NEXT_PUBLIC_SPAREBANK_REDIRECT_URL!,
    finInst: "fid-smn",
    response_type: "code",
  });

  return `${BASE_URL}/oauth/authorize?${params.toString()}`;
}
