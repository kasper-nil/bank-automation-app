import "client-only";

/**
 * Fetches a valid SpareBank access token from the server.
 * Client-side only (Client Components).
 * The server handles cookie reading and token refresh automatically.
 */
export async function fetchSparebankToken(): Promise<string | null> {
  const response = await fetch("/api/auth/sparebank/token");
  if (!response.ok) return null;
  const { access_token } = await response.json();
  return access_token ?? null;
}
