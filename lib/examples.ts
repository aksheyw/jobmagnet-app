import type { BrandStyle, Generation, Narrative, PitchSection } from "@/lib/types";

/**
 * Showcase data for the brand gallery (`/gallery`) and the landing-page example.
 *
 * The candidate is real (Akshey Walia) and so is every fact: the résumé, the
 * metrics, and the Duolingo generation (a genuine JobMagnet run, seed
 * `dNfNbTswsb`). The other seven companies share the same real career history —
 * only the forward-looking framing (headline + About close) and the brand
 * (colors / type / mood) change per company. That keeps the gallery honest: the
 * track record is identical everywhere; the aspiration is clearly aspiration.
 *
 * Contact uses a separate public inbox (aksheyw1@gmail.com — a distinct
 * account, not a +alias) so the indexed page never publishes the primary
 * address.
 */

const NAME = "Akshey Walia";
const CONTACT = "https://www.linkedin.com/in/aksheywalia/";
const EMAIL = "aksheyw1@gmail.com";
const CREATED_AT = "2026-05-29T17:49:11Z";

// Real career history — facts, identical on every card.
const RESUME: Narrative["resume_bullets"] = [
  {
    company: "InMobi",
    title: "Group Product Manager",
    dates: "January 2023 - April 2026",
    bullets: [
      "Led Glance AI lock screen GTM and 0-to-1 workstreams across 8 markets on a platform pre-installed on 250M+ devices.",
      "Grew US distribution from 100K to 6M devices in 18 months through research, Verizon and Motorola integration, and CCPA-aware product strategy.",
      "Improved activation from 25% to 75% by redesigning onboarding with Lottie animations, sharper value props, and funnel-level segmentation.",
      "Raised reactivation from 5% to 25% using weather-triggered nudges for dormant users while preserving uninstall choice despite a 20% funnel drop.",
      "Built a 5-PM team from zero, promoted 2 PMs to Senior PM, and set ownership across 8 markets.",
    ],
  },
  {
    company: "InMobi",
    title: "Senior Product Manager",
    dates: "January 2022 - December 2022",
    bullets: [
      "Drove a lock-screen UI experimentation SDK with engineering, enabling A/B testing inside OEM SystemUI APK and lifting engagement 20%.",
      "Led Motorola's first Glance SystemUI integration, creating reusable patterns later used for Samsung, Sharp, Xiaomi, and telco partnerships.",
      "Scaled Realme from 2M to 25M DAU by solving Android GO constraints, OTA rollout, and new-device out-of-box integration.",
      "Launched Brazil from zero local presence, adapting GTM, Portuguese localization, LGPD compliance, and carrier billing to reach 10M devices.",
    ],
  },
  {
    company: "Magicbricks (Times Internet)",
    title: "Product Manager",
    dates: "August 2015 - December 2021",
    bullets: [
      "Built Pay Rent from zero to INR 50Cr GMV with Razorpay integration, 3 gateway routing, bank cashback wiring, and settlement improvements.",
      "Raised payment success from 95% to 99% by onboarding 2 additional gateways and routing transactions during failure spikes.",
      "Validated 5 property-service verticals manually before automation, scaling from 10 to 500 orders across 10 partners.",
      "Increased home-loan lead generation 40% by redesigning capture flows and onboarding HDFC, ICICI, Standard Chartered, IDFC, and Kotak.",
    ],
  },
  {
    company: "Ocus Group",
    title: "Associate Product Manager",
    dates: "April 2012 - March 2015",
    bullets: [
      "Led 2 product launches into new geographies, generating INR 5Cr in pre-launch revenue.",
    ],
  },
  {
    company: "BPTP Limited",
    title: "Assistant Manager",
    dates: "November 2010 - March 2012",
    bullets: [
      "Drove INR 100Cr revenue through key account management and improved onboarding efficiency by 30%.",
    ],
  },
  {
    company: "Newbridge",
    title: "Assistant Manager",
    dates: "July 2008 - October 2010",
    bullets: [
      "Launched a new revenue channel and improved lead generation by 80% through process redesign.",
    ],
  },
];

// Company-agnostic proof points (metrics are facts; phrasing trimmed of the
// Duolingo/India specifics so the same résumé reads honestly for any employer).
const WHY_FIT_GENERIC: Narrative["why_im_a_fit"] = [
  {
    bullet:
      "Led Glance's US 0-to-1 growth from no playbook to Verizon and Motorola distribution — combining research, GTM, compliance, and product integration.",
    metric: "100K to 6M devices",
  },
  {
    bullet:
      "Built and led a 5-PM team from zero, set ownership across 8 markets, and promoted 2 PMs to Senior PM in 18 months.",
    metric: "5-PM team",
  },
  {
    bullet:
      "Use funnel data, user research, and design iteration to improve habit-forming products — activation, reactivation, and retention.",
    metric: "3X activation",
  },
];

const ABOUT_BASE =
  "I'm a product leader who has spent the last four years growing Glance across markets, partners, and user behaviors that were still being understood. I like roles where strategy has to become shipped product: research, local insight, crisp specs, launch, analysis, and iteration.";

const HEADLINE_PREFIX =
  "Product and AI leader who grew Glance across 8 markets and 250M+ pre-installed devices — ";

const aboutFor = (company: string) =>
  `${ABOUT_BASE} At ${company}, I'd bring experience building PM teams, adapting global products for local markets, and using data and design judgment to make engagement feel natural.`;

// ── Duolingo: a real generation (seed dNfNbTswsb), reproduced faithfully. ──

const DUOLINGO_BRAND: BrandStyle = {
  primary: "#58CC02",
  secondary: "#FFFFFF",
  background: "#FFFFFF",
  headline_font: "din-round",
  body_font: "din-round",
  mood: "minimal",
  source: "brandfetch",
};

const DUOLINGO_WHY_FIT: Narrative["why_im_a_fit"] = [
  {
    bullet:
      "At InMobi, I led Glance's US 0-to-1 growth from no playbook to Verizon and Motorola distribution, combining research, GTM, compliance, and product integration. That maps directly to defining Duolingo's India strategy while adapting global levers for local learners.",
    metric: "100K to 6M devices",
  },
  {
    bullet:
      "I built and led a 5-PM team from zero, set ownership across 8 markets, and promoted 2 PMs to Senior PM in 18 months. Duolingo needs a GPM who can grow a team while keeping urgency and quality high.",
    metric: "5-PM team",
  },
  {
    bullet:
      "I use funnel data, user research, and design iteration to improve habit-forming products, including activation, reactivation, retention, and engagement experiments on the lock screen. That is the same muscle needed to make learning sticky in India.",
    metric: "3X activation",
  },
];

const DUOLINGO_PITCH: PitchSection = {
  stance: "builder",
  seed: "duolingo doesnt offer an option for a user who is on a mission for example needs to prep for an interview and isnt confident about his formal speaking skills under pressure. he needs an option to opt into a shorter mission course which assumes the user doesnt need to upskill in writing or reading and only speaking and comprehension",
  title: "What I'd ship at Duolingo",
  problem:
    "Duolingo's homepage promise is broad: quick lessons that build real-world communication skills across reading, writing, listening, and speaking, while the English course itself now includes job-interview content buried inside later B1/B2 sections. For an India growth user with an urgent English-speaking job outcome, the observable course-entry flow lacks a focused way to declare that mission and start a speaking-heavy habit immediately.",
  hypothesis:
    'If we add a lightweight "Job interview speaking" mission at English onboarding and the course section selector, then D7/D30 retention and lesson starts improve because high-intent learners get a concrete daily loop tied to a career moment instead of searching through the general path.',
  proposed_solution:
    'Ship a next-sprint experiment on the English course start screen: after language selection, add a "Choose your mission" step with the default path plus a "Job interview speaking" card for India English learners. Selecting it creates a 14-day mission lane on the learning path with 8-minute daily sessions: listen to an interview prompt, tap-to-speak an answer, get fluency/pronunciation feedback, then earn normal XP/streak credit; reading and writing exercises remain available but are de-emphasized. Reuse existing B1/B2 interview scenarios and monolingual English-mode content, but package them as a temporary overlay that can hand the learner back to the main path after the mission.',
  metrics_to_track: [
    "Mission card CTR from English onboarding and section selector",
    "First-session completion rate for mission starters vs standard English starters",
    "D7 and D30 retention for India English learners exposed to the mission",
    "Speaking exercise completion rate and repeat attempts per session",
    "Invite/share rate after mission milestones, especially day 3 and day 7",
  ],
  tradeoffs: [
    "A mission lane may fragment the simplicity of Duolingo's single learning path.",
    "Speaking-first sessions can be noisy in public or low-bandwidth contexts common for mobile learners.",
    "Career framing may raise expectations beyond what a short course can deliver.",
    "Repackaging existing content is faster than net-new curriculum, but may feel less personalized without scenario selection.",
  ],
  guardrails: [
    "Keep the mission optional and reversible; never block the standard English path.",
    "Cap sessions at 8 minutes and preserve streak/XP mechanics so it strengthens the daily habit loop.",
    "Localize prompts for Indian job contexts without stereotyping accents or penalizing valid Indian English pronunciation.",
    "Require clear learner consent before microphone use and provide a listen-only fallback.",
    "Measure learning-path progression cannibalization so mission gains do not come from lower overall progress.",
  ],
  evidence: [
    {
      type: "wireframe-svg",
      url: "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20720%20420'%3E%3Crect%20width='720'%20height='420'%20fill='white'/%3E%3Ctext%20x='92'%20y='38'%20font-size='18'%20font-family='Arial'%20font-weight='700'%20fill='%23222'%3EBEFORE:%20generic%20English%20start%3C/text%3E%3Ctext%20x='455'%20y='38'%20font-size='18'%20font-family='Arial'%20font-weight='700'%20fill='%23222'%3EPROPOSED:%20mission%20choice%3C/text%3E%3Crect%20x='70'%20y='62'%20width='250'%20height='318'%20rx='18'%20fill='%23f7f7f7'%20stroke='%23d9d9d9'/%3E%3Crect%20x='400'%20y='62'%20width='250'%20height='318'%20rx='18'%20fill='%23f7f7f7'%20stroke='%23d9d9d9'/%3E%3Crect%20x='100'%20y='92'%20width='190'%20height='46'%20rx='10'%20fill='%2358cc02'/%3E%3Ctext%20x='141'%20y='121'%20font-size='15'%20font-family='Arial'%20font-weight='700'%20fill='white'%3EStart%20English%3C/text%3E%3Ccircle%20cx='195'%20cy='190'%20r='28'%20fill='%2358cc02'/%3E%3Ccircle%20cx='195'%20cy='265'%20r='28'%20fill='%2358cc02'/%3E%3Cline%20x1='195'%20y1='218'%20x2='195'%20y2='237'%20stroke='%2358cc02'%20stroke-width='8'/%3E%3Ctext%20x='120'%20y='330'%20font-size='13'%20font-family='Arial'%20fill='%23555'%3EStandard%20path:%20mixed%20skills%3C/text%3E%3Ctext%20x='120'%20y='350'%20font-size='13'%20font-family='Arial'%20fill='%23555'%3Ereading,%20writing,%20listening,%20speaking%3C/text%3E%3Ctext%20x='430'%20y='94'%20font-size='15'%20font-family='Arial'%20font-weight='700'%20fill='%23222'%3EChoose%20your%20mission%3C/text%3E%3Crect%20x='430'%20y='112'%20width='190'%20height='56'%20rx='10'%20fill='white'%20stroke='%2358cc02'%20stroke-width='3'/%3E%3Ctext%20x='450'%20y='136'%20font-size='13'%20font-family='Arial'%20font-weight='700'%20fill='%23222'%3EJob%20interview%20speaking%3C/text%3E%3Ctext%20x='450'%20y='154'%20font-size='12'%20font-family='Arial'%20fill='%23555'%3E14%20days,%208%20min/day%3C/text%3E%3Crect%20x='430'%20y='184'%20width='190'%20height='42'%20rx='10'%20fill='white'%20stroke='%23d9d9d9'/%3E%3Ctext%20x='470'%20y='211'%20font-size='13'%20font-family='Arial'%20fill='%23555'%3EContinue%20full%20path%3C/text%3E%3Crect%20x='448'%20y='250'%20width='154'%20height='78'%20rx='12'%20fill='%23e8f7ff'%20stroke='%231cb0f6'/%3E%3Ctext%20x='470'%20y='276'%20font-size='13'%20font-family='Arial'%20font-weight='700'%20fill='%23222'%3EDay%201%20session%3C/text%3E%3Ctext%20x='466'%20y='298'%20font-size='12'%20font-family='Arial'%20fill='%23555'%3EListen%20-%20speak%20-%20feedback%3C/text%3E%3Ctext%20x='478'%20y='318'%20font-size='12'%20font-family='Arial'%20fill='%23555'%3EStreak%20+%20XP%20credit%3C/text%3E%3C/svg%3E",
      caption:
        "Before: one generic English path; proposed: an optional job-interview speaking mission at course start.",
    },
  ],
  confidence: 0.82,
};

function makeGeneration(args: {
  readonly company: string;
  readonly domain: string;
  readonly jobTitle: string;
  readonly shortId: string;
  readonly brand: BrandStyle;
  readonly headline: string;
  readonly about: string;
  readonly whyFit: Narrative["why_im_a_fit"];
  readonly pitch: PitchSection | null;
}): Generation {
  return {
    id: args.shortId,
    short_id: args.shortId,
    job_id: args.shortId,
    pitch_reviewed: args.pitch !== null,
    job_context: {
      job_title: args.jobTitle,
      company_name: args.company,
      company_domain: args.domain,
      jd_summary: "",
      must_have_skills: [],
      nice_to_have_skills: [],
      responsibilities: [],
      team_context: "",
      location: "Remote",
      career_level: "manager",
      pitch_suggested_stance: "builder",
      degraded: false,
    },
    brand_style: args.brand,
    narrative: {
      candidate_name: NAME,
      candidate_contact: CONTACT,
      candidate_email: EMAIL,
      headline: args.headline,
      why_im_a_fit: args.whyFit,
      about: args.about,
      cover_letter: "",
      resume_bullets: RESUME,
    },
    pitch_section: args.pitch,
    pitch_stance: args.pitch?.stance ?? null,
    zip_url: null,
    zip_size_bytes: null,
    zip_generated_at: null,
    created_at: CREATED_AT,
    download_count: 0,
  };
}

/** The real Duolingo generation — gallery lead card AND the landing example. */
export const DUOLINGO_EXAMPLE: Generation = makeGeneration({
  company: "Duolingo",
  domain: "duolingo.com",
  jobTitle: "Group Product Manager",
  shortId: "dNfNbTswsb",
  brand: DUOLINGO_BRAND,
  headline:
    "Product and AI leader who grew Glance across 8 markets and 250M+ pre-installed devices — interested in making Duolingo a daily habit for millions of learners in India.",
  about:
    "I'm a product leader who has spent the last four years growing Glance across markets, partners, and user behaviors that were still being understood. I like roles where strategy has to become shipped product: research, local insight, crisp specs, launch, analysis, and iteration. At Duolingo, I'd bring experience building PM teams, adapting global products for local markets, and using data plus design judgment to make daily engagement feel natural instead of forced.",
  whyFit: DUOLINGO_WHY_FIT,
  pitch: DUOLINGO_PITCH,
});

// The other seven: same real candidate, brand-matched, framing tailored per company.
interface CardConfig {
  readonly company: string;
  readonly domain: string;
  readonly moodLabel: string;
  readonly aspiration: string;
  readonly brand: BrandStyle;
}

const OTHER_CARDS: ReadonlyArray<CardConfig> = [
  {
    company: "Notion",
    domain: "notion.so",
    moodLabel: "minimal",
    aspiration: "interested in turning Notion's tools into a daily habit for millions of new users.",
    brand: { primary: "#000000", secondary: "#37352F", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
  {
    company: "Tropic",
    domain: "tropicapp.io",
    moodLabel: "editorial",
    aspiration: "interested in making Tropic's spend platform feel effortless for the teams who rely on it.",
    brand: { primary: "#6C40ED", secondary: "#323234", background: "#FFFFFF", headline_font: "Fraunces", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
  {
    company: "Atlassian",
    domain: "atlassian.com",
    moodLabel: "systematic",
    aspiration: "interested in scaling the team software millions depend on at Atlassian.",
    brand: { primary: "#0052CC", secondary: "#172B4D", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
  {
    company: "Google",
    domain: "google.com",
    moodLabel: "systematic",
    aspiration: "interested in building consumer products at Google's scale, where small UX wins reach billions.",
    brand: { primary: "#4285F4", secondary: "#EA4335", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
  {
    company: "Stripe",
    domain: "stripe.com",
    moodLabel: "tech-dark",
    aspiration: "interested in extending Stripe's product craft to more businesses worldwide.",
    brand: { primary: "#635BFF", secondary: "#0A2540", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "tech-dark", source: "codex-fallback" },
  },
  {
    company: "Figma",
    domain: "figma.com",
    moodLabel: "warm-creative",
    aspiration: "interested in deepening daily engagement across Figma's creative community.",
    brand: { primary: "#F24E1E", secondary: "#A259FF", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
  {
    company: "Sarvam",
    domain: "sarvam.ai",
    moodLabel: "minimal",
    aspiration: "interested in building India-first AI products at Sarvam for the next hundred million users.",
    brand: { primary: "#C1CCF5", secondary: "#323232", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "minimal", source: "brandfetch" },
  },
];

export interface GalleryCard {
  readonly generation: Generation;
  readonly moodLabel: string;
}

/** Duolingo (the real one) leads; the seven illustrative brands follow. */
export const GALLERY_CARDS: ReadonlyArray<GalleryCard> = [
  { generation: DUOLINGO_EXAMPLE, moodLabel: "systematic" },
  ...OTHER_CARDS.map((c) => ({
    moodLabel: c.moodLabel,
    generation: makeGeneration({
      company: c.company,
      domain: c.domain,
      jobTitle: "Group Product Manager",
      shortId: c.domain,
      brand: c.brand,
      headline: `${HEADLINE_PREFIX}${c.aspiration}`,
      about: aboutFor(c.company),
      whyFit: WHY_FIT_GENERIC,
      pitch: null,
    }),
  })),
];
