/**
 * Brand contrast guard.
 *
 * Brandfetch returns a company's real primary color, which is frequently too
 * light (e.g. Sarvam's #C1CCF5 = 1.59:1 on white) to use directly as text. These
 * helpers derive a *legible* color while preserving the brand's hue, so a
 * washed-out lavender becomes a readable lavender — still "their brand", just
 * WCAG-AA compliant.
 *
 * Pure, dependency-free, and defensive: a malformed brand value must never crash
 * a rendered portfolio, so the high-level helpers fall back to a safe dark ink.
 */

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Slate-900-ish. Used as the safe dark ink — never pure black (too harsh). */
const DARK_INK = "#0F172A";
const WHITE = "#FFFFFF";

function parseHex(hex: string): Rgb | null {
  if (typeof hex !== "string") return null;
  const match = hex.trim().match(HEX_RE);
  if (!match) return null;
  const h =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function channelToLinear(value8: number): number {
  const c = value8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance (0 = black, 1 = white). Throws on invalid input. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Invalid hex color: ${hex}`);
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

/** WCAG contrast ratio (1 = identical, 21 = black/white). Order-independent. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp < 1) [r1, g1] = [c, x];
  else if (hp < 2) [r1, g1] = [x, c];
  else if (hp < 3) [g1, b1] = [c, x];
  else if (hp < 4) [g1, b1] = [x, c];
  else if (hp < 5) [r1, b1] = [x, c];
  else [r1, b1] = [c, x];
  const m = l - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

/**
 * Return a color legible as TEXT on `onBg` (default white). If the input already
 * meets the contrast `target` it is returned unchanged (normalized). Otherwise
 * it is darkened in HSL — preserving hue + saturation — until it passes, so the
 * brand identity survives. Invalid input falls back to a safe dark ink.
 *
 * Note: the returned ink is also safe as a FILL behind a white label — contrast
 * is symmetric, so `contrast(ink, white) >= target` implies `contrast(white, ink) >= target`.
 */
export function toReadableInk(
  color: string,
  onBg: string = WHITE,
  target: number = 4.5,
): string {
  const rgb = parseHex(color);
  if (!rgb) return DARK_INK;
  const bg = parseHex(onBg) ? onBg : WHITE;
  if (contrastRatio(color, bg) >= target) return toHex(rgb);

  const { h, s, l: startL } = rgbToHsl(rgb);
  let l = startL;
  let candidate = toHex(rgb);
  while (l > 0) {
    l = Math.max(0, l - 0.01);
    candidate = toHex(hslToRgb(h, s, l));
    if (contrastRatio(candidate, bg) >= target) return candidate;
  }
  return candidate;
}

export interface BrandRoles {
  /** Raw brand primary — decorative use only (tints, borders, dots, gradients). */
  readonly primary: string;
  /**
   * Legible, hue-preserved brand accent. Used both as text on the (white)
   * section background AND as a fill behind a white label (safe via contrast
   * symmetry — see toReadableInk).
   */
  readonly ink: string;
}

/**
 * Map a brand style onto the roles the portfolio actually uses: the raw primary
 * for decoration, and a legible ink for every brand-tinted text/accent. An
 * already-AA brand (e.g. Stripe #635BFF) passes through untouched, so existing
 * dark-brand portfolios are unchanged.
 */
export function deriveBrandRoles(brand: {
  readonly primary: string;
  readonly background?: string;
}): BrandRoles {
  const primary = parseHex(brand.primary) ? brand.primary : DARK_INK;
  // Portfolio sections render on white regardless of brand_style.background,
  // so derive the ink against white — the real rendered context.
  return {
    primary,
    ink: toReadableInk(primary, WHITE, 4.5),
  };
}
