import type { Generation } from "@/lib/types";
import { Hero } from "./Hero";
import { WhyImAFit } from "./WhyImAFit";
import { About } from "./About";
import { Work } from "./Work";
import { PitchSection } from "./PitchSection";
import { InfoBadge } from "./InfoBadge";

interface PortfolioRenderProps {
  readonly generation: Generation;
}

export function PortfolioRender({ generation }: PortfolioRenderProps) {
  const { brand_style, narrative, pitch_section, job_context } = generation;

  const cssVars = {
    "--brand-primary": brand_style.primary,
    "--brand-secondary": brand_style.secondary,
    "--brand-background": brand_style.background,
  } as React.CSSProperties;

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
        ...cssVars,
        backgroundColor: brand_style.background,
        minHeight: "100vh",
      }}
    >
      <Hero
        candidateName={narrative.candidate_name}
        headline={narrative.headline}
        companyName={job_context.company_name}
        brandStyle={brand_style}
      />

      <WhyImAFit items={whyFitItems} brandPrimary={brand_style.primary} />

      {pitch_section && (
        <PitchSection
          pitch={pitch_section}
          companyName={job_context.company_name}
          brandPrimary={brand_style.primary}
        />
      )}

      <Work entries={workEntries} brandPrimary={brand_style.primary} />

      <About text={narrative.about} />

      <footer
        className="px-6 py-5 text-center"
        style={{ backgroundColor: "#0A2540" }}
      >
        <p className="text-sm font-medium text-white">
          {narrative.candidate_name}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {job_context.company_domain}
        </p>
      </footer>

      <InfoBadge />
    </div>
  );
}
