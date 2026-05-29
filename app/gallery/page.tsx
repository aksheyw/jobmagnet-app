import type { Metadata } from "next";
import type { Generation, BrandStyle, PitchSection } from "@/lib/types";
import { PortfolioRender } from "@/components/portfolio/PortfolioRender";

export const metadata: Metadata = {
  title: "Brand gallery — JobMagnet",
  description:
    "One résumé, rendered in seven companies' brands. JobMagnet matches each employer's colors, type, and mood automatically.",
};

// Lightweight inline evidence so the gallery renders with zero network calls.
const wire = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='320' height='180' fill='#ffffff'/><rect x='16' y='16' width='150' height='12' rx='3' fill='#cbd5e1'/><rect x='16' y='40' width='288' height='80' rx='6' fill='#eef2f7'/><rect x='16' y='132' width='220' height='10' rx='3' fill='#e2e8f0'/><text x='16' y='168' font-family='sans-serif' font-size='11' fill='#94a3b8'>${label}</text></svg>`,
  )}`;

const PITCH: PitchSection = {
  stance: "builder",
  seed: "Onboarding drop-off after the first key action.",
  title: "What I'd ship",
  problem:
    "New users hit value late: the first 'aha' is buried three screens deep, and ~40% never reach it.",
  hypothesis:
    "Surfacing one concrete outcome on screen one will lift activation without adding scope.",
  proposed_solution:
    "A single guided first-run that ends in a shareable artifact, instrumented end-to-end.",
  metrics_to_track: ["Activation rate", "Time-to-first-value", "D7 retention"],
  tradeoffs: [
    "Guided flows can feel rigid for power users — make it skippable.",
    "More instrumentation upfront vs. shipping faster.",
  ],
  guardrails: ["No dark patterns; the skip is always one tap away.", "Privacy: aggregate-only telemetry."],
  evidence: [
    { type: "wireframe-svg", url: wire("First-run wireframe"), caption: "Proposed first-run flow" },
    { type: "diagram-svg", url: wire("Activation funnel"), caption: "Where users drop off today" },
  ],
  confidence: 0.8,
};

function makeGen(company: string, domain: string, brand: BrandStyle): Generation {
  return {
    id: domain,
    short_id: domain,
    job_id: domain,
    pitch_reviewed: true,
    job_context: {
      job_title: "Senior Product Manager",
      company_name: company,
      company_domain: domain,
      jd_summary: "",
      must_have_skills: [],
      nice_to_have_skills: [],
      responsibilities: [],
      team_context: "",
      location: "Remote",
      career_level: "senior",
      pitch_suggested_stance: "builder",
      degraded: false,
    },
    brand_style: brand,
    narrative: {
      candidate_name: "Akshey Walia",
      candidate_contact: "linkedin.com/in/aksheywalia",
      // Illustrative gallery — use a placeholder email, not a real scrapeable one.
      candidate_email: "hello@example.com",
      headline: `A product manager who would hit the ground running at ${company}.`,
      why_im_a_fit: [
        { bullet: "Shipped a 0→1 product to 50k MAU as sole PM.", metric: "50k MAU" },
        { bullet: "Cut activation drop-off with a guided first-run.", metric: "+18% activation" },
        { bullet: "Ran weekly experiments against a north-star metric.", metric: "30+ experiments" },
      ],
      about:
        "I'm a product manager who likes shipping small, instrumented bets and reading the results honestly. I care about the first five minutes of a product more than the feature list.",
      cover_letter: "",
      resume_bullets: [
        {
          company: "Sage Labs",
          title: "Senior PM",
          dates: "2023–Now",
          bullets: ["Owned activation; lifted D7 retention 12%.", "Built the experimentation cadence from scratch."],
        },
        { company: "Northwind", title: "PM", dates: "2020–2023", bullets: ["Launched mobile onboarding across 3 markets."] },
      ],
    },
    pitch_section: PITCH,
    pitch_stance: "builder",
    zip_url: null,
    zip_size_bytes: null,
    zip_generated_at: null,
    created_at: "2026-05-29T00:00:00Z",
    download_count: 0,
  };
}

// Seven real brands spanning all five moods. Stripe is shown in its true
// tech-dark identity (the BrandAgent mood the pipeline carries via `source`);
// the rest are classified by the pure color/font heuristic.
const BRANDS: ReadonlyArray<{ company: string; domain: string; mood: string; brand: BrandStyle }> = [
  { company: "Notion", domain: "notion.so", mood: "minimal", brand: { primary: "#000000", secondary: "#37352F", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
  { company: "Tropic", domain: "tropicapp.io", mood: "editorial", brand: { primary: "#6C40ED", secondary: "#323234", background: "#FFFFFF", headline_font: "Fraunces", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
  { company: "Atlassian", domain: "atlassian.com", mood: "systematic", brand: { primary: "#0052CC", secondary: "#172B4D", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
  { company: "Google", domain: "google.com", mood: "systematic", brand: { primary: "#4285F4", secondary: "#EA4335", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
  { company: "Stripe", domain: "stripe.com", mood: "tech-dark", brand: { primary: "#635BFF", secondary: "#0A2540", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "tech-dark", source: "codex-fallback" } },
  { company: "Figma", domain: "figma.com", mood: "warm-creative", brand: { primary: "#F24E1E", secondary: "#A259FF", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
  { company: "Sarvam", domain: "sarvam.ai", mood: "minimal", brand: { primary: "#C1CCF5", secondary: "#323232", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" } },
];

export default function GalleryPage() {
  return (
    <main className="min-h-dvh bg-slate-100">
      <header className="mx-auto max-w-3xl px-6 py-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Brand gallery
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          One résumé. Seven company brands.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          Every portfolio below uses the same candidate and content — only the
          target company changes. JobMagnet matches each employer&apos;s colors,
          type, and mood automatically. These are illustrative examples.
        </p>
      </header>

      <div className="space-y-10 pb-20">
        {BRANDS.map((b) => (
          <section key={b.domain} className="mx-auto max-w-5xl px-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-700">
                {b.company}
                <span className="ml-2 font-normal text-slate-400">{b.domain}</span>
              </h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {b.mood}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 shadow-sm">
              <PortfolioRender
                generation={makeGen(b.company, b.domain, b.brand)}
                showInfoBadge={false}
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
