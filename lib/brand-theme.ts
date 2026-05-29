/**
 * Mood-driven brand theming.
 *
 * The render layer used to collapse every company into one white "minimal"
 * template + a single accent + a hardcoded navy footer. `deriveTheme` instead
 * maps a brand's real colors/fonts onto a full token set whose VALUES (and a few
 * structural flags) change per *mood*, so Notion / Figma / Stripe render
 * genuinely differently — not just a swapped accent.
 *
 * Mood is inferred heuristically from the brand's own colors + fonts (no VPS /
 * agent dependency), because Brandfetch hardcodes `mood: "minimal"` for every
 * real brand. A deliberate non-default mood from the codex BrandAgent is honored.
 *
 * Theming mechanism = inline `style` with resolved hex. EVERY text-bearing token
 * is a concrete hex asserted (in brand-theme.test.ts) against the actual surface
 * it sits on, so the static zip is WCAG-AA with zero JS and no Tailwind purge risk.
 */
import type { BrandStyle } from "./types";
import {
  safeHex,
  mix,
  toReadableOn,
  toReadableInk,
  contrastRatio,
  relativeLuminance,
} from "./brand-contrast";

export interface ThemeFlags {
  readonly heroLayout: "center" | "split-left";
  readonly medallionShape: "circle" | "square" | "circle-glow";
  readonly dividersVisible: "none" | "visible" | "light";
  readonly heroBand: "tint" | "full-color" | "dark-glow";
  readonly cardStyle: "borderless" | "bordered" | "elevated-dark" | "shadow-rounded";
}

export interface TypeToken {
  readonly fontSize: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
  readonly lineHeight: string;
  readonly textTransform?: "uppercase" | "none";
}

export interface Theme {
  // surfaces (concrete hex)
  readonly bg: string;
  readonly surface: string;
  readonly surfaceAlt: string;
  readonly heroBand: string;
  readonly footerBg: string;
  readonly cardBg: string;
  // foregrounds on surface / surfaceAlt
  readonly fg: string;
  readonly muted: string;
  readonly meta: string;
  // foregrounds on the hero band
  readonly onHero: string;
  readonly onHeroMuted: string;
  readonly heroAccent: string;
  // foregrounds on the footer
  readonly onFooter: string;
  readonly onFooterMuted: string;
  // brand accent + decoration
  readonly accent: string;
  readonly onAccent: string;
  readonly primaryDecor: string;
  readonly secondaryAccent: string;
  readonly border: string;
  // typography
  readonly headingFamily: string;
  readonly bodyFamily: string;
  readonly h1: TypeToken;
  readonly h2: TypeToken;
  readonly eyebrow: TypeToken;
  readonly body: TypeToken;
  readonly sectionPy: string;
  // meta
  readonly isDark: boolean;
  readonly mood: BrandStyle["mood"];
  readonly flags: ThemeFlags;
}

const WHITE = "#FFFFFF";
const INK = "#0F172A"; // slate-900 safe dark ink
const FALLBACK_PRIMARY = "#4F46E5"; // indigo — pleasant accent for a degraded brand

// Neutral foreground seeds; toReadableOn nudges them onto the real surface.
const LIGHT_FG = "#0F172A"; // slate-900
const LIGHT_MUTED = "#475569"; // slate-600
const LIGHT_META = "#64748B"; // slate-500
const DARK_FG = "#F5F5F7";
const DARK_MUTED = "#C7C7CF";
const DARK_META = "#9CA3AF";

// Dark-mood canvas bases (mixed with a little brand primary for warmth).
const DARK_BG_BASE = "#0A0A0B";
const DARK_CARD_BASE = "#1A1A1D";
const DARK_FOOTER_BASE = "#060607";

const SERIF_HINTS = [
  "serif",
  "fraunces",
  "lora",
  "playfair",
  "merriweather",
  "georgia",
  "times",
  "garamond",
  "spectral",
  "tiempos",
  "canela",
  "cambria",
  "freight",
];

function isSerif(name: string | undefined | null): boolean {
  const k = (name ?? "").toLowerCase();
  return SERIF_HINTS.some((s) => k.includes(s));
}

interface ColorStats {
  readonly l: number;
  readonly s: number;
  readonly hue: number;
}

/** HSL-ish stats from a brand hex (normalized via safeHex). null if unparseable. */
function stats(hex: string): ColorStats | null {
  const norm = safeHex(hex, "");
  if (!norm) return null;
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2 / 255;
  const s = l === 0 || l === 1 ? 0 : d / 255 / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { l, s, hue };
}

/**
 * Heuristic mood from a brand's own colors + fonts. Order matters: a deliberate
 * agent mood wins, then serif → editorial, dark canvas → tech-dark, then the
 * color character (mono/pale → minimal, warm+saturated → warm-creative,
 * else structured → systematic).
 */
export function inferMood(brand: BrandStyle): BrandStyle["mood"] {
  if (brand.source === "codex-fallback" && brand.mood && brand.mood !== "minimal") {
    return brand.mood;
  }
  if (isSerif(brand.headline_font)) return "editorial";

  const bg = safeHex(brand.background, WHITE);
  if (relativeLuminance(bg) < 0.18) return "tech-dark";

  const st = stats(brand.primary);
  if (!st) return "minimal";
  if (st.s < 0.12) return "minimal"; // achromatic / mono (Notion, grays)
  if (st.l > 0.8) return "minimal"; // very pale (Sarvam)
  const warm = st.hue <= 50 || st.hue >= 340;
  if (warm && st.s > 0.45) return "warm-creative"; // Figma red-orange
  return "systematic"; // structured blue + sans (Atlassian, Google, Stripe→Inc2)
}

function flagsFor(mood: BrandStyle["mood"]): ThemeFlags {
  switch (mood) {
    case "editorial":
      return {
        heroLayout: "split-left",
        medallionShape: "circle",
        dividersVisible: "visible",
        heroBand: "tint",
        cardStyle: "bordered",
      };
    case "systematic":
      return {
        heroLayout: "center",
        medallionShape: "square",
        dividersVisible: "visible",
        heroBand: "tint",
        cardStyle: "bordered",
      };
    case "tech-dark":
      return {
        heroLayout: "center",
        medallionShape: "circle-glow",
        dividersVisible: "light",
        heroBand: "dark-glow",
        cardStyle: "elevated-dark",
      };
    case "warm-creative":
      return {
        heroLayout: "center",
        medallionShape: "circle",
        dividersVisible: "none",
        heroBand: "full-color",
        cardStyle: "shadow-rounded",
      };
    default: // minimal — reproduces today's look
      return {
        heroLayout: "center",
        medallionShape: "circle",
        dividersVisible: "none",
        heroBand: "tint",
        cardStyle: "borderless",
      };
  }
}

function fontStack(name: string | undefined | null, serif: boolean): string {
  const clean = (name ?? "").replace(/["\\\n\r]/g, "").trim();
  const quoted = clean ? `"${clean}", ` : "";
  return serif
    ? `${quoted}Georgia, Cambria, "Times New Roman", serif`
    : `${quoted}ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
}

type TypeSet = Pick<Theme, "h1" | "h2" | "eyebrow" | "body" | "sectionPy">;

function typeFor(mood: BrandStyle["mood"]): TypeSet {
  const eyebrow: TypeToken = {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    lineHeight: "1",
    textTransform: "uppercase",
  };
  const body: TypeToken = {
    fontSize: "1rem",
    fontWeight: 400,
    letterSpacing: "normal",
    lineHeight: "1.65",
  };
  switch (mood) {
    case "warm-creative":
      return {
        h1: { fontSize: "2.6rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: "1.05" },
        h2: { fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: "1.2" },
        eyebrow,
        body,
        sectionPy: "3.75rem",
      };
    case "editorial":
      return {
        h1: { fontSize: "2.6rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: "1.1" },
        h2: { fontSize: "1.7rem", fontWeight: 700, letterSpacing: "normal", lineHeight: "1.2" },
        eyebrow,
        body: { ...body, lineHeight: "1.75" },
        sectionPy: "4rem",
      };
    case "systematic":
      return {
        h1: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: "1.15" },
        h2: { fontSize: "1.4rem", fontWeight: 600, letterSpacing: "normal", lineHeight: "1.25" },
        eyebrow: { ...eyebrow, letterSpacing: "0.08em" },
        body: { ...body, lineHeight: "1.55" },
        sectionPy: "3rem",
      };
    case "tech-dark":
      return {
        h1: { fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: "1.1" },
        h2: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: "1.2" },
        eyebrow,
        body,
        sectionPy: "3.5rem",
      };
    default: // minimal
      return {
        h1: { fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: "1.1" },
        h2: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: "1.2" },
        eyebrow,
        body,
        sectionPy: "3.5rem",
      };
  }
}

function lowestLum(colors: readonly string[]): string {
  return colors.reduce((a, c) =>
    relativeLuminance(c) < relativeLuminance(a) ? c : a,
  );
}
function highestLum(colors: readonly string[]): string {
  return colors.reduce((a, c) =>
    relativeLuminance(c) > relativeLuminance(a) ? c : a,
  );
}

/**
 * Resolve a full theme for a brand. `moodOverride` lets tests cover every mood
 * arm exhaustively and lets a future caller force the codex agent's mood;
 * production omits it and mood is inferred.
 */
export function deriveTheme(
  brand: BrandStyle,
  moodOverride?: BrandStyle["mood"],
): Theme {
  const mood = moodOverride ?? inferMood(brand);
  const isDark = mood === "tech-dark";
  const flags = flagsFor(mood);

  const primary = safeHex(brand.primary, FALLBACK_PRIMARY);
  const secondaryRaw = safeHex(brand.secondary, primary);

  // ---- Surfaces (concrete hex) ----
  let bg: string;
  let surface: string;
  let surfaceAlt: string;
  let cardBg: string;
  let heroBand: string;
  let footerBg: string;
  let border: string;

  // Convention: mix(base, brand, amountTowardBrand). A small amount keeps the
  // base dominant — mixing the order up silently inverts tints (8% vs 92% brand).
  if (isDark) {
    surface = mix(DARK_BG_BASE, primary, 0.08); // ~8% brand into near-black
    surfaceAlt = mix(DARK_BG_BASE, primary, 0.14);
    cardBg = mix(DARK_CARD_BASE, primary, 0.12); // elevated, slightly lighter
    heroBand = mix(DARK_BG_BASE, primary, 0.2); // glow
    footerBg = mix(DARK_FOOTER_BASE, primary, 0.05);
    bg = surface;
    border = mix(surface, WHITE, 0.14); // light hairline on dark
  } else {
    surface =
      mood === "editorial"
        ? "#FBFAF7" // warm off-white
        : mood === "warm-creative"
          ? "#FFFDF8" // cream
          : "#FFFFFF";
    const tintPct =
      mood === "warm-creative"
        ? 0.1
        : mood === "systematic"
          ? 0.05
          : mood === "editorial"
            ? 0.07
            : 0.08;
    surfaceAlt = mix(surface, primary, tintPct); // subtle brand tint
    cardBg = "#FFFFFF"; // white cards + evidence wells (R3)
    bg = surface;
    border = mix(surface, primary, mood === "systematic" ? 0.18 : 0.1);
    heroBand =
      flags.heroBand === "full-color"
        ? toReadableInk(primary, WHITE, 4.5) // rich brand band; white text legible
        : mix(surface, primary, 0.04); // subtle tint
    footerBg =
      mood === "systematic"
        ? mix("#0B1220", primary, 0.16) // 16% brand into deep navy
        : toReadableInk(primary, WHITE, 5.5); // darkened brand; white legible
  }

  // ---- Foregrounds, each derived against the worst-contrast surface it sits on ----
  const ref = isDark
    ? highestLum([surface, surfaceAlt, cardBg]) // light text: hardest on the lightest dark
    : lowestLum([surface, surfaceAlt]); // dark text: hardest on the most-tinted light
  const fg = toReadableOn(isDark ? DARK_FG : LIGHT_FG, ref);
  const muted = toReadableOn(isDark ? DARK_MUTED : LIGHT_MUTED, ref);
  const meta = toReadableOn(isDark ? DARK_META : LIGHT_META, ref);

  // ---- Brand accent ----
  const accent = toReadableOn(primary, ref);
  const onAccent =
    contrastRatio(WHITE, accent) >= contrastRatio(INK, accent) ? WHITE : INK;

  // ---- Hero band foregrounds ----
  const heroLight = flags.heroBand !== "tint"; // dark/saturated band → light text
  const onHero = heroLight
    ? toReadableOn(WHITE, heroBand)
    : toReadableOn(LIGHT_FG, heroBand);
  const onHeroMuted = heroLight
    ? toReadableOn("#D4D4D8", heroBand)
    : toReadableOn(LIGHT_MUTED, heroBand);
  const heroAccent =
    flags.heroBand === "full-color" ? onHero : toReadableOn(primary, heroBand);

  // ---- Footer foregrounds (footerBg is dark by construction) ----
  const onFooter = WHITE;
  const onFooterMuted = toReadableOn("#C8C8D0", footerBg);

  // ---- Decoration ----
  const primaryDecor = primary; // raw brand — dots, borders, gradient seeds only
  const secondaryAccent =
    onAccent === WHITE
      ? toReadableInk(secondaryRaw, WHITE, 3.0) // dark enough for white avatar initials
      : toReadableOn(secondaryRaw, INK, 3.0); // light enough for dark initials

  // ---- Typography ----
  const headingFamily = fontStack(brand.headline_font, mood === "editorial");
  const bodyFamily = fontStack(brand.body_font, false);
  const type = typeFor(mood);

  return {
    bg,
    surface,
    surfaceAlt,
    heroBand,
    footerBg,
    cardBg,
    fg,
    muted,
    meta,
    onHero,
    onHeroMuted,
    heroAccent,
    onFooter,
    onFooterMuted,
    accent,
    onAccent,
    primaryDecor,
    secondaryAccent,
    border,
    headingFamily,
    bodyFamily,
    ...type,
    isDark,
    mood,
    flags,
  };
}
