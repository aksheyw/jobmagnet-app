import { z } from "zod";

/**
 * Runtime validation for `generations.brand_style` at the app render boundary.
 *
 * The app's `/edit/[short_id]` page fetches a generation from an unauthenticated
 * route that does a raw `.select()` with no Zod — so this safeParse is the
 * load-bearing guard (R2) before `deriveTheme` reads the brand. Mirrors
 * `jobmagnet-codex/schemas/brand-style.ts`; keep both in sync.
 */
export const BrandStyleSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  headline_font: z.string().min(1),
  body_font: z.string().min(1),
  mood: z.enum(["minimal", "editorial", "systematic", "tech-dark", "warm-creative"]),
  source: z.enum(["brandfetch", "codex-fallback"]),
});

export type BrandStyleInput = z.infer<typeof BrandStyleSchema>;

/**
 * Render-boundary fallback when `generations.brand_style` fails validation.
 * Defined here (not imported from `brandfetch.ts`) so the client `PortfolioRender`
 * never pulls server-only Supabase code into the browser bundle.
 */
export const BRAND_FALLBACK: BrandStyleInput = {
  primary: "#4F46E5",
  secondary: "#6366F1",
  background: "#FFFFFF",
  headline_font: "Inter",
  body_font: "Inter",
  mood: "minimal",
  source: "codex-fallback",
};
