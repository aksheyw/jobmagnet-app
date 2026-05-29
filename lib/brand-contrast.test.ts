import { describe, it, expect } from "vitest";
import {
  relativeLuminance,
  contrastRatio,
  toReadableInk,
  toReadableOn,
  mix,
  darken,
  safeHex,
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

describe("safeHex", () => {
  it("returns a valid 6-digit hex untouched (normalized to uppercase)", () => {
    expect(safeHex("#635bff", "#000000")).toBe("#635BFF");
  });

  it("expands 3-digit shorthand", () => {
    expect(safeHex("#abc", "#000000")).toBe("#AABBCC");
  });

  it("returns the fallback for an unparseable value", () => {
    expect(safeHex("not-a-color", "#111111")).toBe("#111111");
  });

  it("returns the fallback for an empty string", () => {
    expect(safeHex("", "#222222")).toBe("#222222");
  });
});

describe("mix", () => {
  it("returns the first color at t=0 and the second at t=1", () => {
    expect(mix("#FFFFFF", "#000000", 0)).toBe("#FFFFFF");
    expect(mix("#FFFFFF", "#000000", 1)).toBe("#000000");
  });

  it("blends to the exact midpoint at t=0.5", () => {
    expect(mix("#000000", "#FFFFFF", 0.5)).toBe("#808080");
  });

  it("produces a tint whose luminance sits between the two inputs", () => {
    const tint = mix("#635BFF", "#FFFFFF", 0.1); // 10% indigo into white
    const l = relativeLuminance(tint);
    expect(l).toBeGreaterThan(relativeLuminance("#635BFF"));
    expect(l).toBeLessThan(relativeLuminance("#FFFFFF"));
  });

  it("never crashes on a malformed input (guards both ends)", () => {
    expect(() => mix("garbage", "#FFFFFF", 0.5)).not.toThrow();
    expect(mix("garbage", "#FFFFFF", 0.5)).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe("darken", () => {
  it("returns the color unchanged at pct=0", () => {
    expect(darken("#635BFF", 0)).toBe("#635BFF");
  });

  it("drives a color toward black, lowering its luminance", () => {
    const dark = darken("#635BFF", 0.72);
    expect(relativeLuminance(dark)).toBeLessThan(relativeLuminance("#635BFF"));
    expect(dark).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("reaches black at pct=1", () => {
    expect(darken("#FFFFFF", 1)).toBe("#000000");
  });
});

describe("toReadableOn", () => {
  it("darkens a pale brand color on a LIGHT surface (matches toReadableInk behavior)", () => {
    const ink = toReadableOn("#C1CCF5", "#FFFFFF");
    expect(contrastRatio(ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(relativeLuminance(ink)).toBeLessThan(relativeLuminance("#C1CCF5"));
  });

  it("LIGHTENS a mid-tone brand color on a DARK surface until it passes AA", () => {
    // Stripe #635BFF on near-black is only ~3.8:1 — must be lightened, not darkened.
    const onDark = "#0A0A0B";
    const accent = toReadableOn("#635BFF", onDark);
    expect(contrastRatio(accent, onDark)).toBeGreaterThanOrEqual(4.5);
    expect(relativeLuminance(accent)).toBeGreaterThan(relativeLuminance("#635BFF"));
  });

  it("preserves brand hue when lightening on dark (indigo stays blue-dominant)", () => {
    const accent = toReadableOn("#635BFF", "#0A0A0B");
    const h = accent.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const b = parseInt(h.slice(4, 6), 16);
    expect(b).toBeGreaterThan(r); // still blue-dominant, not washed to white
  });

  it("lightens pure black on a dark surface (starts at lightness 0)", () => {
    // Notion's #000000 on a near-black canvas must lighten to a legible gray —
    // the lightening loop has to run even when the starting lightness is 0.
    const onDark = "#0A0A0B";
    expect(contrastRatio(toReadableOn("#000000", onDark), onDark)).toBeGreaterThanOrEqual(4.5);
  });

  it("leaves an already-legible color unchanged on its surface", () => {
    // Pale lavender on near-black already has high contrast — return as-is.
    const onDark = "#0A0A0B";
    expect(contrastRatio(toReadableOn("#C1CCF5", onDark), onDark)).toBeGreaterThanOrEqual(4.5);
  });

  it("falls back to a legible color on a dark surface when input is malformed", () => {
    const onDark = "#0A0A0B";
    expect(contrastRatio(toReadableOn("not-a-color", onDark), onDark)).toBeGreaterThanOrEqual(4.5);
  });

  it("falls back to a legible color on a light surface when input is malformed", () => {
    expect(contrastRatio(toReadableOn("nope", "#FFFFFF"), "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });
});
