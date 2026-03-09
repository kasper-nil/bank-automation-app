import type { NextRequest } from "next/server";
import type { SparebankToken } from "./token.server";

const COOKIE_NAME = "sparebank_token";

/**
 * Returns the stored SpareBank token from the request cookies.
 * For use in middleware only — middleware runs on the edge and cannot
 * use next/headers, so the token is read directly from the request.
 */
export function getSparebankToken(request: NextRequest): SparebankToken | null {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SparebankToken;
  } catch {
    return null;
  }
}
