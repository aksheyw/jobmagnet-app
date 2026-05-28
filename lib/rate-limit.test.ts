import { describe, it, expect, vi } from "vitest";
import {
  getClientIp,
  dailyBucketKey,
  checkRateLimit,
  secondsUntilNextUtcDay,
  GEN_DAILY_LIMIT,
} from "./rate-limit";

describe("getClientIp", () => {
  it("uses the first entry of x-forwarded-for (the Vercel-set client IP)", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" });
    expect(getClientIp(h)).toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    const h = new Headers({ "x-forwarded-for": "  203.0.113.7  " });
    expect(getClientIp(h)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const h = new Headers({ "x-real-ip": "198.51.100.9" });
    expect(getClientIp(h)).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("dailyBucketKey", () => {
  it("builds a `prefix:ip:UTC-date` key", () => {
    const d = new Date("2026-05-29T13:45:00Z");
    expect(dailyBucketKey("gen", "203.0.113.7", d)).toBe(
      "gen:203.0.113.7:2026-05-29",
    );
  });

  it("rolls to a new bucket at UTC midnight (auto-reset)", () => {
    const before = new Date("2026-05-29T23:59:59Z");
    const after = new Date("2026-05-30T00:00:01Z");
    expect(dailyBucketKey("gen", "x", before)).not.toBe(
      dailyBucketKey("gen", "x", after),
    );
  });
});

describe("secondsUntilNextUtcDay", () => {
  it("counts down to the next UTC midnight", () => {
    expect(secondsUntilNextUtcDay(new Date("2026-05-29T23:59:59Z"))).toBe(1);
    expect(secondsUntilNextUtcDay(new Date("2026-05-29T00:00:00Z"))).toBe(86400);
  });

  it("never returns less than 1", () => {
    expect(
      secondsUntilNextUtcDay(new Date("2026-05-29T23:59:59.999Z")),
    ).toBeGreaterThanOrEqual(1);
  });
});

describe("checkRateLimit", () => {
  it("allows when the new count is under the limit", async () => {
    const r = await checkRateLimit(async () => 1, "k", 10);
    expect(r.allowed).toBe(true);
    expect(r.count).toBe(1);
  });

  it("allows on the exact limit boundary (count <= limit)", async () => {
    const r = await checkRateLimit(async () => 10, "k", 10);
    expect(r.allowed).toBe(true);
  });

  it("blocks when the new count exceeds the limit", async () => {
    const r = await checkRateLimit(async () => 11, "k", 10);
    expect(r.allowed).toBe(false);
    expect(r.count).toBe(11);
  });

  it("passes the exact key to the increment fn", async () => {
    const inc = vi.fn(async () => 1);
    await checkRateLimit(inc, "gen:1.2.3.4:2026-05-29", 10);
    expect(inc).toHaveBeenCalledWith("gen:1.2.3.4:2026-05-29");
  });

  it("fails OPEN when the store throws (never block legit users on infra error)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await checkRateLimit(
      async () => {
        throw new Error("db down");
      },
      "k",
      10,
    );
    expect(r.allowed).toBe(true);
    expect(r.count).toBe(0);
    spy.mockRestore();
  });

  it("fails OPEN when increment returns a non-finite count (don't silently block)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await checkRateLimit(async () => Number.NaN, "k", 10);
    expect(r.allowed).toBe(true);
    expect(r.count).toBe(0);
    spy.mockRestore();
  });
});

describe("GEN_DAILY_LIMIT", () => {
  it("is a generous default (>= 10) so judges aren't blocked", () => {
    expect(GEN_DAILY_LIMIT).toBeGreaterThanOrEqual(10);
  });
});
