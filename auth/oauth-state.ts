import "server-only";
import { createHmac, randomBytes } from "crypto";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}

const SECRET = process.env.BETTER_AUTH_SECRET;
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface OAuthState {
  userId: string;
  nonce: string;
  issuedAt: number;
}

/**
 * Create a signed state token for OAuth flows.
 * Format: base64(userId|nonce|issuedAt|signature)
 */
export function createSignedState(userId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const issuedAt = Date.now();

  const payload = `${userId}|${nonce}|${issuedAt}`;
  const signature = createHmac("sha256", SECRET).update(payload).digest("hex");

  const state = `${payload}|${signature}`;
  return Buffer.from(state).toString("base64");
}

/**
 * Verify and parse a signed state token.
 * Returns the parsed state if valid, throws if invalid or expired.
 */
export function verifySignedState(encodedState: string): OAuthState {
  let state: string;
  try {
    state = Buffer.from(encodedState, "base64").toString("utf8");
  } catch {
    throw new Error("Invalid state encoding");
  }

  const parts = state.split("|");
  if (parts.length !== 4) {
    throw new Error("Invalid state format");
  }

  const [userId, nonce, issuedAtStr, signature] = parts;

  const issuedAt = parseInt(issuedAtStr, 10);
  if (isNaN(issuedAt)) {
    throw new Error("Invalid state timestamp");
  }

  // Check expiry
  if (Date.now() - issuedAt > STATE_EXPIRY_MS) {
    throw new Error("State token expired");
  }

  // Verify signature
  const payload = `${userId}|${nonce}|${issuedAtStr}`;
  const expectedSignature = createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid state signature");
  }

  return { userId, nonce, issuedAt };
}
