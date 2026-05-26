import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_EXP_DAYS = 7;

function getKey(): string {
  const key = process.env.HMAC_SIGNING_KEY;
  if (!key) throw new Error("HMAC_SIGNING_KEY env var must be set");
  return key;
}

/**
 * Sign an edit link for a (short_id, email) pair. Lightweight magic-link
 * MVP per spec §18.3 — Day 4 Final replaces with a bcrypt-hashed crypto flow.
 *
 * Token format: `<exp_unix>.<hmac32>` so the link URL looks like
 *   /edit/<short_id>?from=email&t=<token>&e=<email>
 */
export function signEditToken(
  shortId: string,
  email: string,
  expiresInDays: number = DEFAULT_EXP_DAYS,
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 86400;
  const payload = `${shortId}:${email.toLowerCase()}:${exp}`;
  const sig = createHmac("sha256", getKey()).update(payload).digest("hex").slice(0, 32);
  return `${exp}.${sig}`;
}

export function verifyEditToken(
  shortId: string,
  email: string,
  token: string,
): boolean {
  const [expStr, sigPart] = token.split(".");
  if (!expStr || !sigPart) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", getKey())
    .update(`${shortId}:${email.toLowerCase()}:${exp}`)
    .digest("hex")
    .slice(0, 32);
  if (sigPart.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sigPart, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
