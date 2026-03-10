import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (!/^[0-9a-f]{64}$/i.test(encryptionKey)) {
  throw new Error(
    "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );
}

// ENCRYPTION_KEY is a 32-byte hex string for AES-256
const ENCRYPTION_KEY = Buffer.from(encryptionKey, "hex");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv.encrypted.authTag (all hex)
  return `${iv.toString("hex")}.${encrypted}.${authTag.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encryptedHex, authTagHex] = encrypted.split(".");

  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
