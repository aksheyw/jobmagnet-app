import { randomBytes } from "node:crypto";

/**
 * Generate a URL-safe short ID (default 10 chars from a 56-char alphabet).
 * Safe for routing: contains no characters that need URL-encoding. Avoids
 * confusable characters (0/O, 1/l/I).
 */
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortId(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}
