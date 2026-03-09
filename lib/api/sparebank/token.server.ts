import "server-only";
import { cookies } from "next/headers";

export interface SparebankToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  state: number;
  issued_at: number;
}

const COOKIE_NAME = "sparebank_token";

/**
 * Returns the stored SpareBank token from the HttpOnly cookie.
 * Server-side only (Server Components, Route Handlers, Server Actions).
 * Does not refresh — delegate that to GET /api/auth/sparebank/token.
 */
export async function getSparebankToken(): Promise<SparebankToken | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SparebankToken;
  } catch {
    return null;
  }
}
