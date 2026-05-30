import type { Generation } from "@/lib/types";
import { deriveTheme } from "@/lib/brand-theme";
import { BrandStyleSchema, BRAND_FALLBACK } from "@/lib/schemas/brand-style";
import { googleFontLinks } from "@/lib/font-map";
import { Hero } from "./Hero";
import { WhyImAFit } from "./WhyImAFit";
import { About } from "./About";
import { Work } from "./Work";
import { PitchSection } from "./PitchSection";
import { InfoBadge } from "./InfoBadge";

interface PortfolioRenderProps {
  readonly generation: Generation;
  /** Suppress the floating "about" badge (e.g. the gallery renders many portfolios). */
  readonly showInfoBadge?: boolean;
  /**
   * Heading level for the hero name. Defaults to 1 (standalone portfolio page).
   * Embedded previews (gallery, landing example) pass 2 so the host page keeps
   * a single top-level h1.
   */
  readonly headingLevel?: 1 | 2;
}

export function PortfolioRender({
  generation,
  showInfoBadge = true,
  headingLevel = 1,
}: PortfolioRenderProps) {
  const { brand_style, narrative, pitch_section, job_context } = generation;

  // R2: the brand arrives from an unauthenticated route with a raw `.select()`
  // and no Zod, so validate here — the load-bearing guard before deriveTheme.
  const parsed = BrandStyleSchema.safeParse(brand_style);
  const brand = parsed.success ? parsed.data : BRAND_FALLBACK;
  const theme = deriveTheme(brand);
  // Load the brand's actual typeface at render time (allowlisted Google fonts);
  // proprietary faces degrade to the fontStack's generic fallback.
  const fontLinks = googleFontLinks([brand.headline_font, brand.body_font]);

  const whyFitItems = narrative.why_im_a_fit.map((item) => ({
    bullet: item.bullet,
    metric: item.metric,
  }));

  const workEntries = narrative.resume_bullets.map((entry) => ({
    company: entry.company,
    title: entry.title,
    dates: entry.dates,
    bullets: entry.bullets,
  }));

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        color: theme.fg,
        fontFamily: theme.bodyFamily,
        minHeight: "100vh",
        // Keep dark-mood surfaces when printing / saving to PDF (otherwise the
        // browser drops backgrounds and light text vanishes on white paper).
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      {fontLinks.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <Hero
        theme={theme}
        candidateName={narrative.candidate_name}
        candidateContact={narrative.candidate_contact}
        candidateEmail={narrative.candidate_email}
        headline={narrative.headline}
        companyName={job_context.company_name}
        headingLevel={headingLevel}
      />

      <WhyImAFit theme={theme} items={whyFitItems} />

      {pitch_section && (
        <PitchSection
          theme={theme}
          pitch={pitch_section}
          companyName={job_context.company_name}
        />
      )}

      <Work theme={theme} entries={workEntries} />

      <About theme={theme} text={narrative.about} />

      <footer
        className="px-6 py-6 text-center"
        style={{ backgroundColor: theme.footerBg }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: theme.onFooter, fontFamily: theme.headingFamily }}
        >
          {narrative.candidate_name}
        </p>
        <p className="mt-1 text-xs" style={{ color: theme.onFooterMuted }}>
          {job_context.company_domain}
        </p>
      </footer>

      {showInfoBadge && <InfoBadge />}
    </div>
  );
}
