import "client-only";
import { authClient } from "@/auth/auth-client";

/**
 * Fetches a valid SpareBank access token from the server.
 * Client-side only (Client Components).
 * The server handles database reading and token refresh automatically.
 */
export async function fetchSparebankToken(): Promise<string | null> {
  try {
    const response = await (authClient.sparebankConnect as any).token();
    if (!response || !response.data?.accessToken) {
      return null;
    }
    return response.data.accessToken;
  } catch (error) {
    console.error("Failed to fetch Sparebank token:", error);
    return null;
  }
}
