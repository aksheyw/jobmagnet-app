import { describe, it, expect } from "vitest";
import type { BrandStyle } from "./types";
import { contrastRatio, relativeLuminance } from "./brand-contrast";
import { deriveTheme, inferMood, type Theme } from "./brand-theme";

const MOODS: BrandStyle["mood"][] = [
  "minimal",
  "editorial",
  "systematic",
  "tech-dark",
  "warm-creative",
];

// Adversarial primaries: Stripe (mid indigo), Sarvam (pale lavender — the
// contrast trap), Notion (pure black, mono), and a malformed value that must
// never crash the render we're protecting.
const PRIMARIES = [
  { name: "Stripe", primary: "#635BFF", secondary: "#0A2540" },
  { name: "Sarvam", primary: "#C1CCF5", secondary: "#323232" },
  { name: "Notion", primary: "#000000", secondary: "#37352F" },
  { name: "malformed", primary: "", secondary: "" },
];

function brandFor(
  p: { primary: string; secondary: string },
  mood: BrandStyle["mood"],
  font = "Inter",
): BrandStyle {
  return {
    primary: p.primary,
    secondary: p.secondary,
    background: "#FFFFFF",
    headline_font: font,
    body_font: "Inter",
    mood,
    source: "brandfetch",
  };
}

const HEX = /^#[0-9A-F]{6}$/;

// Normal text needs 4.5:1; large/decorative (avatar initials, hero display)
// can use 3.0:1 per WCAG.
function expectReadable(fg: string, bg: string, label: string, target = 4.5) {
  const ratio = contrastRatio(fg, bg);
  expect(
    ratio,
    `${label}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (need ${target})`,
  ).toBeGreaterThanOrEqual(target);
}

/** Every text/accent token asserted against the SURFACE IT ACTUALLY SITS ON. */
function assertThemeReadable(t: Theme, ctx: string) {
  // body text + labels on the main + alternate (tinted) surfaces
  expectReadable(t.fg, t.surface, `${ctx} fg/surface`);
  expectReadable(t.fg, t.surfaceAlt, `${ctx} fg/surfaceAlt`);
  expectReadable(t.muted, t.surface, `${ctx} muted/surface`);
  expectReadable(t.muted, t.surfaceAlt, `${ctx} muted/surfaceAlt`);
  expectReadable(t.meta, t.surface, `${ctx} meta/surface`);
  expectReadable(t.meta, t.surfaceAlt, `${ctx} meta/surfaceAlt`); // the live pitch-label bug
  // brand accent on both surfaces (eyebrows sit on white AND on the pitch tint)
  expectReadable(t.accent, t.surface, `${ctx} accent/surface`);
  expectReadable(t.accent, t.surfaceAlt, `${ctx} accent/surfaceAlt`);
  // label on an accent fill (CTA, chips) — never hardcoded white
  expectReadable(t.onAccent, t.accent, `${ctx} onAccent/accent`);
  // card / evidence well foregrounds
  expectReadable(t.fg, t.cardBg, `${ctx} fg/cardBg`);
  expectReadable(t.muted, t.cardBg, `${ctx} muted/cardBg`);
  // hero band
  expectReadable(t.onHero, t.heroBand, `${ctx} onHero/heroBand`);
  expectReadable(t.onHeroMuted, t.heroBand, `${ctx} onHeroMuted/heroBand`);
  expectReadable(t.heroAccent, t.heroBand, `${ctx} heroAccent/heroBand`);
  // footer
  expectReadable(t.onFooter, t.footerBg, `${ctx} onFooter/footerBg`);
  expectReadable(t.onFooterMuted, t.footerBg, `${ctx} onFooterMuted/footerBg`);
  // avatar: white-ish initials over an accent→secondaryAccent gradient (large)
  expectReadable(t.onAccent, t.secondaryAccent, `${ctx} onAccent/secondaryAccent`, 3.0);
}

describe("inferMood (heuristic — no VPS / agent dependency)", () => {
  it("returns minimal for an achromatic/mono brand (Notion #000000)", () => {
    expect(inferMood(brandFor({ primary: "#000000", secondary: "#37352F" }, "minimal"))).toBe(
      "minimal",
    );
  });

  it("returns minimal for a very pale primary (Sarvam #C1CCF5)", () => {
    expect(inferMood(brandFor({ primary: "#C1CCF5", secondary: "#323232" }, "minimal"))).toBe(
      "minimal",
    );
  });

  it("returns editorial when the headline font is a serif (Tropic)", () => {
    const tropic = brandFor(
      { primary: "#6C40ED", secondary: "#323234" },
      "minimal",
      "Fraunces",
    );
    expect(inferMood(tropic)).toBe("editorial");
  });

  it("returns warm-creative for a warm, saturated hue (Figma #F24E1E)", () => {
    expect(inferMood(brandFor({ primary: "#F24E1E", secondary: "#A259FF" }, "minimal"))).toBe(
      "warm-creative",
    );
  });

  it("returns systematic for a structured blue + sans (Atlassian, Google)", () => {
    expect(inferMood(brandFor({ primary: "#0052CC", secondary: "#172B4D" }, "minimal"))).toBe(
      "systematic",
    );
    expect(inferMood(brandFor({ primary: "#4285F4", secondary: "#EA4335" }, "minimal"))).toBe(
      "systematic",
    );
  });

  it("returns tech-dark when the brand background is dark", () => {
    const darkBg: BrandStyle = {
      ...brandFor({ primary: "#635BFF", secondary: "#0A2540" }, "minimal"),
      background: "#0A0A0B",
    };
    expect(inferMood(darkBg)).toBe("tech-dark");
  });

  it("honors a deliberate non-default mood from the codex agent", () => {
    const agent: BrandStyle = {
      ...brandFor({ primary: "#635BFF", secondary: "#0A2540" }, "tech-dark"),
      source: "codex-fallback",
    };
    expect(inferMood(agent)).toBe("tech-dark");
  });

  it("ignores a default 'minimal' agent mood and falls back to the heuristic", () => {
    // Figma data but agent left mood at the default — heuristic should still classify.
    const agentDefault: BrandStyle = {
      ...brandFor({ primary: "#F24E1E", secondary: "#A259FF" }, "minimal"),
      source: "codex-fallback",
    };
    expect(inferMood(agentDefault)).toBe("warm-creative");
  });

  it("never throws on a malformed primary", () => {
    expect(() => inferMood(brandFor({ primary: "", secondary: "" }, "minimal"))).not.toThrow();
  });
});

describe("deriveTheme — R1 contrast matrix (THE gate)", () => {
  for (const mood of MOODS) {
    for (const p of PRIMARIES) {
      it(`every token is legible on its real surface: ${mood} × ${p.name}`, () => {
        const theme = deriveTheme(brandFor(p, mood), mood);
        assertThemeReadable(theme, `${mood}/${p.name}`);
      });
    }
  }

  it("never throws on a malformed brand and emits only concrete hex (no raw pass-through)", () => {
    const t = deriveTheme(brandFor({ primary: "", secondary: "garbage" }, "tech-dark"), "tech-dark");
    for (const token of [
      t.bg,
      t.surface,
      t.surfaceAlt,
      t.heroBand,
      t.footerBg,
      t.cardBg,
      t.fg,
      t.muted,
      t.meta,
      t.accent,
      t.onAccent,
      t.onHero,
      t.onHeroMuted,
      t.heroAccent,
      t.onFooter,
      t.onFooterMuted,
      t.primaryDecor,
      t.secondaryAccent,
      t.border,
    ]) {
      expect(token).toMatch(HEX);
    }
  });
});

describe("deriveTheme — distinctness levers (would have caught the original bug)", () => {
  const sameBrand = { primary: "#635BFF", secondary: "#0A2540" };

  it("tech-dark is a genuinely dark canvas; minimal is light", () => {
    const dark = deriveTheme(brandFor(sameBrand, "tech-dark"), "tech-dark");
    const light = deriveTheme(brandFor(sameBrand, "minimal"), "minimal");
    expect(dark.isDark).toBe(true);
    expect(light.isDark).toBe(false);
    expect(relativeLuminance(dark.surface)).toBeLessThan(0.2);
    expect(relativeLuminance(light.surface)).toBeGreaterThan(0.8);
  });

  it("the SAME brand renders a different canvas per mood (not one collapsed template)", () => {
    const surfaces = MOODS.map((m) => deriveTheme(brandFor(sameBrand, m), m).surface);
    expect(new Set(surfaces).size).toBeGreaterThan(1);
  });

  it("structural flags differ across moods (layout/cards/dividers, not just accent)", () => {
    const warm = deriveTheme(brandFor(sameBrand, "warm-creative"), "warm-creative");
    const techDark = deriveTheme(brandFor(sameBrand, "tech-dark"), "tech-dark");
    const minimal = deriveTheme(brandFor(sameBrand, "minimal"), "minimal");
    const systematic = deriveTheme(brandFor(sameBrand, "systematic"), "systematic");
    const editorial = deriveTheme(brandFor(sameBrand, "editorial"), "editorial");

    expect(warm.flags.heroBand).toBe("full-color");
    expect(techDark.flags.heroBand).toBe("dark-glow");
    expect(minimal.flags.dividersVisible).toBe("none");
    expect(systematic.flags.cardStyle).not.toBe("borderless");
    expect(editorial.flags.dividersVisible).toBe("visible");
  });

  it("minimal reproduces today's look: light surface + a brand-hued, legible accent", () => {
    const t = deriveTheme(brandFor(sameBrand, "minimal"), "minimal");
    expect(relativeLuminance(t.surface)).toBeGreaterThan(0.9); // white/near-white
    expectReadable(t.accent, t.surface, "minimal accent");
    // accent keeps the indigo identity (blue-dominant), not slammed to gray/black
    const h = t.accent.replace("#", "");
    expect(parseInt(h.slice(4, 6), 16)).toBeGreaterThan(parseInt(h.slice(0, 2), 16));
  });

  it("editorial uses a serif heading family; minimal uses sans", () => {
    const editorial = deriveTheme(brandFor(sameBrand, "editorial"), "editorial");
    const minimal = deriveTheme(brandFor(sameBrand, "minimal"), "minimal");
    expect(editorial.headingFamily.toLowerCase()).toContain("serif");
    expect(minimal.headingFamily.toLowerCase()).toContain("sans-serif");
  });

  it("warm-creative weights the display heavier than minimal", () => {
    const warm = deriveTheme(brandFor(sameBrand, "warm-creative"), "warm-creative");
    const minimal = deriveTheme(brandFor(sameBrand, "minimal"), "minimal");
    expect(warm.h1.fontWeight).toBeGreaterThan(minimal.h1.fontWeight);
  });
});

describe("deriveTheme — mood resolution + footer (no hardcoded #0A2540)", () => {
  it("infers mood when no override is given", () => {
    const figma = brandFor({ primary: "#F24E1E", secondary: "#A259FF" }, "minimal");
    expect(deriveTheme(figma).mood).toBe("warm-creative");
  });

  it("derives the footer from the brand, never the hardcoded Stripe navy", () => {
    const t = deriveTheme(brandFor({ primary: "#F24E1E", secondary: "#A259FF" }, "warm-creative"));
    expect(t.footerBg).not.toBe("#0A2540");
    expectReadable(t.onFooter, t.footerBg, "footer text");
  });
});
