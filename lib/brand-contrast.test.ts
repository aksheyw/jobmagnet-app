import { describe, it, expect } from "vitest";
import {
  relativeLuminance,
  contrastRatio,
  toReadableInk,
  deriveBrandRoles,
} from "./brand-contrast";

// Small hex parser used only to make assertions about the *shape* of returned
// colors (e.g. "blue is still the dominant channel after darkening").
function rgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

describe("relativeLuminance", () => {
  it("is 1 for white", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("is 0 for black", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("is ~0.216 for mid gray (#808080)", () => {
    expect(relativeLuminance("#808080")).toBeCloseTo(0.216, 2);
  });

  it("accepts 3-digit shorthand hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
  });

  it("is case-insensitive", () => {
    expect(relativeLuminance("#c1ccf5")).toBeCloseTo(
      relativeLuminance("#C1CCF5"),
      6,
    );
  });

  it("throws on an unparseable color", () => {
    expect(() => relativeLuminance("not-a-color")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for white on black (the maximum)", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1:1 for identical colors", () => {
    expect(contrastRatio("#635BFF", "#635BFF")).toBeCloseTo(1, 5);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#C1CCF5", "#FFFFFF")).toBeCloseTo(
      contrastRatio("#FFFFFF", "#C1CCF5"),
      6,
    );
  });

  it("confirms the Sarvam primary #C1CCF5 fails AA on white (the bug)", () => {
    const ratio = contrastRatio("#C1CCF5", "#FFFFFF");
    expect(ratio).toBeGreaterThan(1.4);
    expect(ratio).toBeLessThan(1.7);
    expect(ratio).toBeLessThan(4.5); // below WCAG AA for normal text
  });
});

describe("toReadableInk", () => {
  it("returns a color that already passes AA unchanged", () => {
    expect(toReadableInk("#333333")).toBe("#333333");
  });

  it("darkens a pale brand color until it passes AA on white", () => {
    const ink = toReadableInk("#C1CCF5");
    expect(ink).not.toBe("#C1CCF5");
    expect(contrastRatio(ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves the brand hue when darkening (lavender stays blue-dominant, not gray/black)", () => {
    const ink = rgb(toReadableInk("#C1CCF5"));
    expect(ink.b).toBeGreaterThan(ink.r);
    expect(ink.b).toBeGreaterThan(ink.g);
    expect(relativeLuminance(toReadableInk("#C1CCF5"))).toBeGreaterThan(0); // not pure black
  });

  it("darkens only as far as needed (does not slam to black)", () => {
    const ratio = contrastRatio(toReadableInk("#C1CCF5"), "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(8);
  });

  it("makes an achromatic gray legible too (no hue to preserve)", () => {
    // #808080 is 3.95:1 on white — below AA. Zero saturation means the HSL
    // darken loop only lowers lightness; it must still terminate ≥ 4.5:1.
    expect(contrastRatio(toReadableInk("#808080"), "#FFFFFF")).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("honors a higher contrast target by darkening further", () => {
    const aa = relativeLuminance(toReadableInk("#C1CCF5", "#FFFFFF", 4.5));
    const stricter = relativeLuminance(toReadableInk("#C1CCF5", "#FFFFFF", 7));
    expect(stricter).toBeLessThan(aa);
  });

  it("falls back to a safe dark ink when the color is unparseable", () => {
    const ink = toReadableInk("not-a-color");
    expect(contrastRatio(ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("deriveBrandRoles", () => {
  it("keeps the raw primary for decorative use", () => {
    expect(deriveBrandRoles({ primary: "#C1CCF5" }).primary).toBe("#C1CCF5");
  });

  it("derives a legible text ink for a pale brand (Sarvam)", () => {
    const roles = deriveBrandRoles({ primary: "#C1CCF5", background: "#FFFFFF" });
    expect(contrastRatio(roles.ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    // The ink is also safe as a fill behind a white label (contrast symmetry).
    expect(contrastRatio("#FFFFFF", roles.ink)).toBeGreaterThanOrEqual(4.5);
  });

  it("leaves an already-AA brand untouched (Stripe stays exactly #635BFF)", () => {
    const roles = deriveBrandRoles({ primary: "#635BFF", background: "#FFFFFF" });
    expect(roles.primary).toBe("#635BFF");
    expect(roles.ink).toBe("#635BFF");
  });

  it("stays safe when the brand primary is missing or malformed", () => {
    const roles = deriveBrandRoles({ primary: "" });
    expect(contrastRatio(roles.ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });
});
