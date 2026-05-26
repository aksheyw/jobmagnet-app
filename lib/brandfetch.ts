import { createSupabaseAdmin } from "./supabase/server";

const BRANDFETCH_BASE = "https://api.brandfetch.io/v2/brands";
const CACHE_TTL_HOURS = 24 * 7; // 7 days

export interface BrandStyleResult {
  primary: string;
  secondary: string;
  background: string;
  headline_font: string;
  body_font: string;
  mood: "minimal" | "editorial" | "systematic" | "tech-dark" | "warm-creative";
  source: "brandfetch" | "codex-fallback";
}

interface BrandfetchColor {
  hex: string;
  type?: string;
  brightness?: number;
}

interface BrandfetchFont {
  name: string;
  type?: string;
  origin?: string;
}

interface BrandfetchResponse {
  name?: string;
  domain?: string;
  colors?: BrandfetchColor[];
  fonts?: BrandfetchFont[];
}

const FALLBACK: BrandStyleResult = {
  primary: "#0F172A",
  secondary: "#475569",
  background: "#FFFFFF",
  headline_font: "Inter",
  body_font: "Inter",
  mood: "minimal",
  source: "codex-fallback",
};

/**
 * Look up brand identity via Brandfetch. Caches successful responses in
 * Supabase `brand_cache` for 7 days. Returns null when Brandfetch
 * returns insufficient data (caller should fall back to Codex BrandSage).
 */
export async function fetchBrandfetch(
  domain: string,
): Promise<BrandStyleResult | null> {
  const cached = await readCache(domain);
  if (cached) return cached;

  const key = process.env.BRANDFETCH_API_KEY;
  if (!key) {
    console.warn("BRANDFETCH_API_KEY not set; skipping primary brand lookup");
    return null;
  }

  let raw: BrandfetchResponse;
  try {
    const res = await fetch(`${BRANDFETCH_BASE}/${encodeURIComponent(domain)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(
        `brandfetch returned ${res.status} for ${domain}; will fall back`,
      );
      return null;
    }
    raw = (await res.json()) as BrandfetchResponse;
  } catch (err) {
    console.warn(
      `brandfetch fetch threw for ${domain}; will fall back`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }

  const result = mapBrandfetch(raw);
  if (!result) return null;

  await writeCache(domain, result).catch((err) => {
    console.warn("brand_cache write failed", err instanceof Error ? err.message : err);
  });
  return result;
}

function mapBrandfetch(raw: BrandfetchResponse): BrandStyleResult | null {
  const colors = raw.colors ?? [];
  const fonts = raw.fonts ?? [];

  const primary =
    findColor(colors, "accent") ?? findColor(colors, "primary") ?? colors[0]?.hex;
  if (!primary) return null;

  const secondary = colors[1]?.hex ?? lighten(primary);
  const background = findColor(colors, "light") ?? "#FFFFFF";

  const headlineFont =
    fonts.find((f) => f.type === "title")?.name ??
    fonts[0]?.name ??
    "Inter";
  const bodyFont =
    fonts.find((f) => f.type === "body")?.name ?? headlineFont;

  return {
    primary: normalizeHex(primary),
    secondary: normalizeHex(secondary),
    background: normalizeHex(background),
    headline_font: headlineFont,
    body_font: bodyFont,
    mood: "minimal",
    source: "brandfetch",
  };
}

function findColor(
  colors: BrandfetchColor[],
  type: string,
): string | undefined {
  return colors.find((c) => c.type === type)?.hex;
}

function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  if (cleaned.length === 6) return `#${cleaned.toUpperCase()}`;
  return "#0F172A"; // safe fallback
}

function lighten(hex: string): string {
  // very simple "tint" approx: blend with white at 40%. For MVP this is
  // good enough; a proper OkLCH blend can wait for Day 4 polish.
  const c = normalizeHex(hex).slice(1);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * 0.4);
  const toHex = (v: number) => v.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

async function readCache(domain: string): Promise<BrandStyleResult | null> {
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from("brand_cache")
      .select("brand_style, expires_at")
      .eq("domain", domain.toLowerCase())
      .maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      return null;
    }
    return data.brand_style as BrandStyleResult;
  } catch (err) {
    console.warn("brand_cache read failed", err instanceof Error ? err.message : err);
    return null;
  }
}

async function writeCache(
  domain: string,
  brandStyle: BrandStyleResult,
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600_000).toISOString();
  await supabase
    .from("brand_cache")
    .upsert({
      domain: domain.toLowerCase(),
      brand_style: brandStyle,
      expires_at: expiresAt,
    });
}

export const BRAND_FALLBACK = FALLBACK;
