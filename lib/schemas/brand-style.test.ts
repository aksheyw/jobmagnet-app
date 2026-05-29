import { describe, it, expect } from "vitest";
import { BrandStyleSchema, BRAND_FALLBACK } from "./brand-style";

// The R2 render-boundary guard: PortfolioRender does
//   BrandStyleSchema.safeParse(brand_style) → on failure, deriveTheme(BRAND_FALLBACK).
// `generations.brand_style` is a nullable jsonb column fetched from an
// unauthenticated route, so the guard must reject null/garbage AND the fallback
// must itself be a valid BrandStyle (or the "safe" path would feed bad data in).
describe("BrandStyleSchema (R2 render-boundary guard)", () => {
  it("rejects null (the column is nullable)", () => {
    expect(BrandStyleSchema.safeParse(null).success).toBe(false);
  });

  it("rejects a malformed object (bad hex / missing fields)", () => {
    expect(BrandStyleSchema.safeParse({ primary: "red" }).success).toBe(false);
    expect(
      BrandStyleSchema.safeParse({ ...BRAND_FALLBACK, primary: "not-a-hex" }).success,
    ).toBe(false);
  });

  it("accepts a well-formed brand style", () => {
    const ok = {
      primary: "#635BFF",
      secondary: "#0A2540",
      background: "#FFFFFF",
      headline_font: "Inter",
      body_font: "Inter",
      mood: "tech-dark",
      source: "codex-fallback",
    };
    expect(BrandStyleSchema.safeParse(ok).success).toBe(true);
  });

  it("BRAND_FALLBACK is itself valid — the safe path never feeds bad data to deriveTheme", () => {
    expect(BrandStyleSchema.safeParse(BRAND_FALLBACK).success).toBe(true);
  });
});
