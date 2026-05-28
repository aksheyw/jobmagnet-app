/**
 * Per-IP fixed-window rate limiting for the public generation endpoint (F92).
 *
 * Goal: stop a single visitor from draining the shared ChatGPT Plus quota via the
 * public /api/generate link, WITHOUT blocking judges who try a handful of times.
 * The policy lives here (unit-tested); the database is used only as an atomic counter
 * (see increment_rate_limit() in migration 0002).
 */

// Generous daily cap per IP. Override with RATE_LIMIT_GEN_PER_DAY to relax for a demo.
export const GEN_DAILY_LIMIT = Number(process.env.RATE_LIMIT_GEN_PER_DAY) || 10;

// TTL on a daily counter row: comfortably covers the 24h window plus a cleanup grace.
export const RATE_LIMIT_TTL_SECONDS = 60 * 60 * 48;

/**
 * Resolve the client IP. On Vercel, `x-forwarded-for` is set by the platform and
 * external IPs are NOT forwarded (spoof-safe unless an Enterprise trusted proxy is
 * enabled), so its first entry is the real client. `x-real-ip` is a fallback. Local
 * dev (no proxy headers) collapses to "unknown" — acceptable; not the threat surface.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  return real || "unknown";
}

/** Fixed-window bucket key: `<prefix>:<ip>:<UTC date>`. A new key each UTC day = auto-reset. */
export function dailyBucketKey(prefix: string, ip: string, now: Date): string {
  const day = now.toISOString().slice(0, 10);
  return `${prefix}:${ip}:${day}`;
}

/** Seconds until the daily bucket resets (next UTC midnight). Used for the Retry-After header. */
export function secondsUntilNextUtcDay(now: Date): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

/**
 * Increment the counter for `key` and decide whether the request is allowed.
 * `increment` must atomically add 1 and return the NEW count (the Postgres upsert RPC).
 * Fails OPEN: a rate limiter must never take the service down when its store is down.
 */
export async function checkRateLimit(
  increment: (key: string) => Promise<number>,
  key: string,
  limit: number,
): Promise<RateLimitResult> {
  try {
    const count = await increment(key);
    // A non-finite count means "the store returned something we can't trust"
    // (e.g. an unexpected RPC shape) — treat it like a store error and fail open
    // rather than letting `NaN <= limit` (always false) silently block the request.
    if (!Number.isFinite(count)) {
      console.error("[rate-limit] non-numeric count, failing open", count);
      return { allowed: true, count: 0, limit };
    }
    return { allowed: count <= limit, count, limit };
  } catch (err) {
    console.error("[rate-limit] store error, failing open", err);
    return { allowed: true, count: 0, limit };
  }
}
