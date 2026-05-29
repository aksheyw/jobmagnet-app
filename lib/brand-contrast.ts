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

const BLACK = "#000000";

/**
 * Return `input` as a normalized uppercase hex if it parses, else `fallback`.
 * The single guard `deriveTheme` uses before passing any brand value into a
 * contrast call — `contrastRatio`/`relativeLuminance` throw on non-hex, so an
 * empty or "red" brand color must be sanitized here first.
 */
export function safeHex(input: string, fallback: string): string {
  const rgb = parseHex(input);
  return rgb ? toHex(rgb) : fallback;
}

/**
 * RGB-linear blend from `a` (t=0) to `b` (t=1). Convention: mix(base, brand,
 * amountTowardBrand) — e.g. `mix("#FFFFFF", primary, 0.1)` is a 10%-brand tint of
 * white. Computes the concrete hex of a tinted surface so foregrounds can be
 * contrast-asserted against a real color instead of a CSS `color-mix` the build
 * can't measure. Malformed ends degrade to safe neutrals (never throws).
 */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a) ?? parseHex(DARK_INK)!;
  const cb = parseHex(b) ?? parseHex(WHITE)!;
  const k = Math.max(0, Math.min(1, t));
  return toHex({
    r: ca.r + (cb.r - ca.r) * k,
    g: ca.g + (cb.g - ca.g) * k,
    b: ca.b + (cb.b - ca.b) * k,
  });
}

/** Drive a color `pct` of the way toward black (RGB mix). General hex helper. */
export function darken(hex: string, pct: number): string {
  return mix(hex, BLACK, pct);
}

/**
 * Like `toReadableInk`, but legible against ANY surface: darkens the color on a
 * light surface, **lightens** it on a dark one (for dark-mood portfolios). Hue +
 * saturation are preserved via HSL, so a pale brand becomes an asset on dark.
 * Malformed input falls back to a neutral that passes on the given surface.
 */
export function toReadableOn(
  color: string,
  onBg: string,
  target: number = 4.5,
): string {
  const bg = parseHex(onBg) ? onBg : WHITE;
  const bgIsLight = relativeLuminance(bg) > 0.5;

  const rgb = parseHex(color);
  if (!rgb) return bgIsLight ? DARK_INK : "#F5F5F7";

  const normalized = toHex(rgb);
  if (contrastRatio(normalized, bg) >= target) return normalized;

  const { h, s, l: startL } = rgbToHsl(rgb);
  let l = startL;
  let candidate = normalized;
  const step = bgIsLight ? -0.01 : 0.01;
  // Bounded walk: darken (light bg) or lighten (dark bg) toward the target.
  // A for-loop — not `while (l > 0 && l < 1)` — so it still runs from lightness
  // 0 (pure black on a dark surface) or 1 (pure white on a light surface).
  for (let i = 0; i < 101; i++) {
    l = Math.max(0, Math.min(1, l + step));
    candidate = toHex(hslToRgb(h, s, l));
    if (contrastRatio(candidate, bg) >= target) return candidate;
    if (l <= 0 || l >= 1) break;
  }
  return candidate;
}

// (deriveBrandRoles / BrandRoles removed — superseded by deriveTheme's full
// Theme token set in brand-theme.ts; the old primary+ink role model is unused.)
