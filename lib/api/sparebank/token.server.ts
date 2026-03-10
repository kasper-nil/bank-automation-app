import "server-only";
import { auth } from "@/auth/auth";
import { db } from "@/db";
import { sparebankConnection } from "@/db/auth-schema";
import { headers } from "next/headers";
import { decryptToken } from "@/auth/crypto";
import { eq } from "drizzle-orm";

export interface SparebankToken {
  access_token: string;
  token_type: string;
  expiresAt: Date;
  refresh_token: string;
  tokenType: string;
}

/**
 * Returns the stored SpareBank token from the database for the authenticated user.
 * Server-side only (Server Components, Route Handlers, Server Actions).
 * Automatically refreshes expired tokens.
 *
 * @param userId - The user ID. If not provided, attempts to read from session.
 */
export async function getSparebankToken(
  userId?: string,
): Promise<SparebankToken | null> {
  // Get the authenticated user's ID
  let effectiveUserId = userId;
  if (!effectiveUserId) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    effectiveUserId = session?.user.id;
  }

  if (!effectiveUserId) {
    return null;
  }

  try {
    // Query the database for the connection
    const connection = await db.query.sparebankConnection.findFirst({
      where: eq(sparebankConnection.userId, effectiveUserId),
    });

    if (!connection) {
      return null;
    }

    // Check if token is expired
    const expiresAt = new Date(connection.expiresAt);
    if (expiresAt <= new Date()) {
      // Token expired — try to refresh it
      return refreshSparebankToken(effectiveUserId);
    }

    // Decrypt tokens
    const accessToken = decryptToken(connection.accessToken);
    const refreshToken = decryptToken(connection.refreshToken);

    return {
      access_token: accessToken,
      token_type: connection.tokenType,
      expiresAt,
      refresh_token: refreshToken,
      tokenType: connection.tokenType,
    };
  } catch (error) {
    console.error("Error getting Sparebank token:", error);
    return null;
  }
}

/**
 * Refresh an expired Sparebank token.
 */
async function refreshSparebankToken(
  userId: string,
): Promise<SparebankToken | null> {
  const SPAREBANK_TOKEN_ENDPOINT = "https://api.sparebank1.no/oauth/token";

  try {
    const connection = await db.query.sparebankConnection.findFirst({
      where: eq(sparebankConnection.userId, userId),
    });

    if (!connection) {
      return null;
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(connection.refreshToken);

    // Call Sparebank token endpoint
    const tokenResponse = await fetch(SPAREBANK_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
        client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to refresh Sparebank token");
      return null;
    }

    interface TokenResponse {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      state?: number;
    }

    const tokens = (await tokenResponse.json()) as TokenResponse;
    const { encryptToken } = await import("@/auth/crypto");

    // Calculate new expiry time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Encrypt new tokens
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Update in database
    await db
      .update(sparebankConnection)
      .set({
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenType: tokens.token_type,
        expiresAt,
      })
      .where(eq(sparebankConnection.userId, userId));

    return {
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expiresAt,
      refresh_token: tokens.refresh_token,
      tokenType: tokens.token_type,
    };
  } catch (error) {
    console.error("Error refreshing Sparebank token:", error);
    return null;
  }
}
