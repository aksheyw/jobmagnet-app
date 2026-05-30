/**
 * Curated example data for the Pitch-agent onboarding preview in the wizard.
 * Illustrative only — clearly labeled "Example" in the UI. Lets a first-time
 * user see what the Pitch agent produces (and how it adapts per company)
 * before they enable it. Rendered by the real <PitchSection> component.
 */
import type { BrandStyle, PitchSection as PitchType } from "@/lib/types";

export type Stance = "builder" | "analyst" | "customer" | "strategist";
export type CompanyKey = "duolingo" | "cred" | "amazon";

export const COMPANY_KEYS: CompanyKey[] = ["duolingo", "cred", "amazon"];

const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 220'>${body}</svg>`,
  )}`;

const wireframeUri = (a: string) =>
  svg(
    `<rect width='360' height='220' fill='#F4F4F5'/><rect x='120' y='22' width='120' height='176' rx='16' fill='#fff' stroke='#D4D4D8'/><rect x='134' y='42' width='92' height='10' rx='5' fill='#E4E4E7'/><rect x='134' y='62' width='92' height='52' rx='10' fill='${a}' fill-opacity='0.12' stroke='${a}'/><circle cx='151' cy='88' r='10' fill='${a}'/><rect x='169' y='80' width='46' height='7' rx='3.5' fill='#A1A1AA'/><rect x='169' y='93' width='32' height='6' rx='3' fill='#D4D4D8'/><rect x='134' y='128' width='92' height='26' rx='8' fill='${a}'/><rect x='160' y='137' width='40' height='8' rx='4' fill='#fff'/>`,
  );

const chartUri = (a: string) =>
  svg(
    `<rect width='360' height='220' fill='#F4F4F5'/><line x1='44' y1='182' x2='322' y2='182' stroke='#D4D4D8'/><rect x='74' y='112' width='44' height='70' rx='4' fill='${a}' fill-opacity='0.35'/><rect x='150' y='82' width='44' height='100' rx='4' fill='${a}' fill-opacity='0.62'/><rect x='226' y='52' width='44' height='130' rx='4' fill='${a}'/>`,
  );

export const COMPANIES: Record<CompanyKey, { name: string; brand: BrandStyle }> = {
  duolingo: {
    name: "Duolingo",
    brand: { primary: "#58CC02", secondary: "#1CB0F6", background: "#FFFFFF", headline_font: "Nunito", body_font: "Nunito", mood: "warm-creative", source: "codex-fallback" },
  },
  cred: {
    name: "CRED",
    brand: { primary: "#D9C7FF", secondary: "#8A7CB8", background: "#0E0E12", headline_font: "Space Grotesk", body_font: "Inter", mood: "tech-dark", source: "codex-fallback" },
  },
  amazon: {
    name: "Amazon",
    brand: { primary: "#FF9900", secondary: "#146EB4", background: "#FFFFFF", headline_font: "Inter", body_font: "Inter", mood: "systematic", source: "codex-fallback" },
  },
};

type RawPitch = Omit<PitchType, "seed" | "confidence">;

const RAW: Record<CompanyKey, Record<Stance, (accent: string) => RawPitch>> = {
  duolingo: {
    builder: (a) => ({
      stance: "builder", title: "Streak repair",
      problem: "A single missed day breaks a streak — and broken streaks are Duolingo's sharpest silent-churn trigger for otherwise-motivated learners.",
      hypothesis: "A lightweight 'streak repair' recovers more D7 retention than a harder paywall.",
      proposed_solution: "One-tap streak repair: a single free lesson restores a lost streak the same day, framed as 'bounce back', not 'you lost it'.",
      metrics_to_track: ["D7 retention (lapsed)", "Repair completion", "Repair → paid"],
      tradeoffs: ["Over-softening streak pressure could dilute the core habit loop.", "Free repairs may cannibalize Super upsell."],
      guardrails: ["Cap repairs to 1 per 14 days so stakes stay real."],
      evidence: [{ type: "wireframe-svg", url: wireframeUri(a), caption: "Streak-repair moment — same-day recovery" }],
    }),
    analyst: (a) => ({
      stance: "analyst", title: "Activation leak",
      problem: "Activation likely leaks between first lesson and day-3 return, but the drop-off isn't instrumented by acquisition source.",
      hypothesis: "Social-sourced learners churn faster pre-streak than search-sourced ones, needing a different day-0 path.",
      proposed_solution: "Instrument a day-0 → day-3 funnel split by source and first-lesson difficulty; cohort readout before any build.",
      metrics_to_track: ["Day-0→3 return by source", "First-lesson completion", "Time-to-first-streak"],
      tradeoffs: ["Source-level instrumentation adds tracking + privacy review."],
      guardrails: ["Read-only analysis first — no UX change until the gap is sized."],
      evidence: [{ type: "diagram-svg", url: chartUri(a), caption: "Day-0→3 funnel, split by acquisition source" }],
    }),
    customer: () => ({
      stance: "customer", title: "The lapse moment",
      problem: "After a long streak, missing one day makes the app lead with loss ('you lost your 47-day streak!') instead of a path back.",
      hypothesis: "Reframing the lapse from punishment to recovery reduces rage-quit uninstalls.",
      proposed_solution: "Rewrite the lapse screen around 'pick up where you left off', with the streak restorable in one lesson.",
      metrics_to_track: ["Uninstalls within 24h of streak loss", "Lapse-screen → lesson rate"],
      tradeoffs: ["Softer copy must not read as guilt-tripping."],
      guardrails: [], evidence: [],
    }),
    strategist: () => ({
      stance: "strategist", title: "The India wedge",
      problem: "Growth in India is throttled by English-for-its-own-sake framing in a market that wants English for opportunity.",
      hypothesis: "Positioning around job/exam outcomes (not gamified streaks) unlocks the tier-2 India wedge.",
      proposed_solution: "Pilot an 'English for interviews' track with outcome milestones, marketed through regional creators.",
      metrics_to_track: ["Tier-2 India activation", "Outcome-track completion"],
      tradeoffs: ["Outcome framing risks diluting the playful brand.", "Requires regional content investment."],
      guardrails: ["Run as a contained pilot before brand-level changes."], evidence: [],
    }),
  },
  cred: {
    builder: (a) => ({
      stance: "builder", title: "Post-payment reward",
      problem: "After paying a card bill, members hit a rewards grid that's a wall of options — the highest-intent moment under-converts.",
      hypothesis: "A single personalized reward CTA right after payment beats the grid.",
      proposed_solution: "Replace the post-payment grid with one ranked reward + 'see all', personalized by spend pattern.",
      metrics_to_track: ["Post-payment reward CTR", "Redemption rate", "Repeat bill-pay"],
      tradeoffs: ["A single CTA risks hiding partner inventory that partners paid for."],
      guardrails: ["Hold partner-revenue neutral in the A/B."],
      evidence: [{ type: "wireframe-svg", url: wireframeUri(a), caption: "One ranked reward, surfaced on payment success" }],
    }),
    analyst: (a) => ({
      stance: "analyst", title: "Rewards causality",
      problem: "It's unclear whether rewards drive bill-pay retention or just attract reward-seekers who'd pay anyway.",
      hypothesis: "Reward engagement is correlated with, not causal to, retention for the top spend decile.",
      proposed_solution: "Run a matched holdout: suppress rewards for a cohort and measure 90-day bill-pay retention.",
      metrics_to_track: ["90-day retention (holdout vs control)", "Reward-attributed lift"],
      tradeoffs: ["A reward holdout risks short-term satisfaction dips."],
      guardrails: ["Small, time-boxed holdout with instant rollback."],
      evidence: [{ type: "diagram-svg", url: chartUri(a), caption: "Retention: rewards holdout vs control" }],
    }),
    customer: () => ({
      stance: "customer", title: "The reward reveal",
      problem: "Paying a bill should feel like a win, but the reward reveal is buried behind taps and feels transactional.",
      hypothesis: "An immediate, tactile reveal raises the emotional payoff of paying on CRED.",
      proposed_solution: "Surface one celebratory reveal the instant payment clears, before any grid.",
      metrics_to_track: ["Reveal view rate", "Post-payment NPS"],
      tradeoffs: ["The animation must stay fast on low-end devices."],
      guardrails: [], evidence: [],
    }),
    strategist: () => ({
      stance: "strategist", title: "Beyond premium",
      problem: "CRED's premium-only positioning caps TAM as India's credit-card base broadens beyond the top tier.",
      hypothesis: "A trust-first 'responsible credit' wedge extends down-market without diluting prestige.",
      proposed_solution: "Pilot a credit-health track as a separate sub-brand, co-marketed with issuers.",
      metrics_to_track: ["Down-market activation", "Credit-health retention"],
      tradeoffs: ["Down-market risks prestige dilution.", "Issuer partnerships add dependency."],
      guardrails: ["Separate sub-brand to protect the core."], evidence: [],
    }),
  },
  amazon: {
    builder: (a) => ({
      stance: "builder", title: "Return reasons",
      problem: "Starting a return forces a reason taxonomy that doesn't match how people think ('it didn't fit' vs 12 SKU-specific reasons).",
      hypothesis: "An intent-first reason flow reduces abandoned returns and support contacts.",
      proposed_solution: "Collapse return reasons to 4 intents with smart follow-ups, defaulting to the fastest resolution.",
      metrics_to_track: ["Return completion", "Contacts per return", "Time-to-refund"],
      tradeoffs: ["Fewer surfaced reasons reduce granularity for category teams."],
      guardrails: ["Keep the detailed reason in the backend mapping."],
      evidence: [{ type: "wireframe-svg", url: wireframeUri(a), caption: "Intent-first return flow — 4 reasons" }],
    }),
    analyst: (a) => ({
      stance: "analyst", title: "Return abandonment",
      problem: "Return abandonment isn't attributed — we don't know if it's the reason picker, label printing, or drop-off location.",
      hypothesis: "Label/drop-off friction, not the reason step, drives most abandonment in metro cohorts.",
      proposed_solution: "Instrument the return funnel step-by-step and segment by drop-off availability.",
      metrics_to_track: ["Step-level return funnel", "Abandonment by drop-off density"],
      tradeoffs: ["Funnel instrumentation spans several teams."],
      guardrails: ["Analysis-only before any flow change."],
      evidence: [{ type: "diagram-svg", url: chartUri(a), caption: "Return funnel by step, metro cohort" }],
    }),
    customer: () => ({
      stance: "customer", title: "The broken promise",
      problem: "When a delivery slips, the promise updates silently — customers refresh to find out, eroding the trust it's meant to build.",
      hypothesis: "Proactive, specific delay comms preserve trust better than a silently-updated date.",
      proposed_solution: "Push a proactive 'running late + new ETA + why' the moment a promise breaks.",
      metrics_to_track: ["Post-delay CSAT", "WISMO contacts per late order"],
      tradeoffs: ["Over-notifying risks alert fatigue."],
      guardrails: [], evidence: [],
    }),
    strategist: () => ({
      stance: "strategist", title: "D2C loyalty",
      problem: "Amazon's selection edge is eroding in India where D2C brands build direct loyalty off-platform.",
      hypothesis: "A brand-storefront + portable loyalty layer keeps emerging D2C brands on Amazon.",
      proposed_solution: "Offer first-party brand storefronts with portable loyalty, piloted with 10 India D2C brands.",
      metrics_to_track: ["D2C retention on-platform", "Storefront-attributed GMV"],
      tradeoffs: ["Empowering brands may reduce Amazon's pricing leverage."],
      guardrails: ["Pilot scope limited to 10 brands."], evidence: [],
    }),
  },
};

const EXAMPLE_CONFIDENCE = 0.82;

const SEEDS: Record<CompanyKey, string> = {
  duolingo:
    "Missing one day after a long streak makes the app lead with what you lost, not how to bounce back.",
  cred: "After paying a card bill, the rewards screen is a wall of options at the highest-intent moment.",
  amazon:
    "Starting a return forces a reason taxonomy that doesn't match how people actually think.",
};

// Inject the data-only fields (seed, confidence) the app's PitchSection type
// requires but the preview doesn't render — keeps the 12 payloads above lean.
const withMeta =
  (ck: CompanyKey, make: (accent: string) => RawPitch) =>
  (accent: string): PitchType => ({
    seed: SEEDS[ck],
    confidence: EXAMPLE_CONFIDENCE,
    ...make(accent),
  });

// Explicit literal (not Object.fromEntries) so TypeScript verifies every
// company × stance key is present — no casts, no exhaustiveness gaps.
export const PITCHES: Record<
  CompanyKey,
  Record<Stance, (accent: string) => PitchType>
> = {
  duolingo: {
    builder: withMeta("duolingo", RAW.duolingo.builder),
    analyst: withMeta("duolingo", RAW.duolingo.analyst),
    customer: withMeta("duolingo", RAW.duolingo.customer),
    strategist: withMeta("duolingo", RAW.duolingo.strategist),
  },
  cred: {
    builder: withMeta("cred", RAW.cred.builder),
    analyst: withMeta("cred", RAW.cred.analyst),
    customer: withMeta("cred", RAW.cred.customer),
    strategist: withMeta("cred", RAW.cred.strategist),
  },
  amazon: {
    builder: withMeta("amazon", RAW.amazon.builder),
    analyst: withMeta("amazon", RAW.amazon.analyst),
    customer: withMeta("amazon", RAW.amazon.customer),
    strategist: withMeta("amazon", RAW.amazon.strategist),
  },
};
