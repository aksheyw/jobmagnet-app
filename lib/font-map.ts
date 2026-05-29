/**
 * Allowlist of fonts mappable to `next/font/google` imports. Keys are
 * display names (case-insensitive, whitespace-tolerant) returned by
 * BrandAgent / Brandfetch; values are the exact `next/font/google` export
 * symbol names.
 *
 * If a font is not in this map, CodeAgent falls back to `Inter` to keep
 * the template buildable.
 *
 * SYNC: the byte-identical RENDER twins are this file (`jobmagnet-app/lib/font-map.ts`)
 * and `jobmagnet-codex/template/lib/font-map.ts` — both export `googleFontLinks`
 * (the app preview and the downloaded zip load brand fonts identically). Keep
 * those two in sync. `jobmagnet-codex/lib/font-map.ts` is the PIPELINE copy used
 * by CodeAgent (`resolveFont` only — no `googleFontLinks`); it shares the
 * allowlist but intentionally omits the render helper.
 */
const FONT_MAP: Record<string, string> = {
  inter: "Inter",
  "dm serif display": "DM_Serif_Display",
  "ibm plex sans": "IBM_Plex_Sans",
  "ibm plex serif": "IBM_Plex_Serif",
  "ibm plex mono": "IBM_Plex_Mono",
  roboto: "Roboto",
  "roboto mono": "Roboto_Mono",
  poppins: "Poppins",
  lora: "Lora",
  manrope: "Manrope",
  "plus jakarta sans": "Plus_Jakarta_Sans",
  fraunces: "Fraunces",
  "space grotesk": "Space_Grotesk",
  "space mono": "Space_Mono",
  "work sans": "Work_Sans",
  "nunito sans": "Nunito_Sans",
  nunito: "Nunito",
  montserrat: "Montserrat",
  lato: "Lato",
  "open sans": "Open_Sans",
  raleway: "Raleway",
  "playfair display": "Playfair_Display",
  merriweather: "Merriweather",
  "noto sans": "Noto_Sans",
  "noto serif": "Noto_Serif",
  "source sans 3": "Source_Sans_3",
  "source serif 4": "Source_Serif_4",
  // R6 additions (brand-theming): common modern brand sans faces.
  "hanken grotesk": "Hanken_Grotesk",
  archivo: "Archivo",
};

const FALLBACK = "Inter";

export interface ResolvedFont {
  /** Exact next/font/google import symbol (e.g., "DM_Serif_Display"). */
  importName: string;
  /** The original requested name (preserved for telemetry). */
  requested: string;
  /** Whether this is a fallback (requested font wasn't in the allowlist). */
  fellBack: boolean;
}

export function resolveFont(requested: string | undefined | null): ResolvedFont {
  const raw = (requested ?? "").trim();
  if (!raw) {
    return { importName: FALLBACK, requested: FALLBACK, fellBack: true };
  }
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  const importName = FONT_MAP[key];
  if (!importName) {
    return { importName: FALLBACK, requested: raw, fellBack: true };
  }
  return { importName, requested: raw, fellBack: false };
}

export function isAllowedFont(requested: string): boolean {
  const key = requested.trim().toLowerCase().replace(/\s+/g, " ");
  return key in FONT_MAP;
}

/**
 * Build Google Fonts `<link>` hrefs for the allowlisted fonts among `requested`,
 * so a portfolio actually LOADS its brand typeface at render time (the live
 * preview and the static zip both render the named family instead of falling
 * back to a system font). Canonical casing comes from the allowlist symbol
 * (e.g. "Hanken_Grotesk" → "Hanken Grotesk"); non-allowlisted/proprietary faces
 * (no Google entry) are skipped and degrade to the fontStack's generic fallback.
 * `:wght@400;700` covers body + heading weights; single-weight faces that reject
 * 700 simply fail their own link and fall back — no other family is affected.
 */
export function googleFontLinks(
  requested: ReadonlyArray<string | undefined | null>,
): string[] {
  const seen = new Set<string>();
  const links: string[] = [];
  for (const name of requested) {
    const key = (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    const symbol = key ? FONT_MAP[key] : undefined;
    if (!symbol) continue;
    const family = symbol.replace(/_/g, " ");
    if (seen.has(family)) continue;
    seen.add(family);
    links.push(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;700&display=swap`,
    );
  }
  return links;
}
