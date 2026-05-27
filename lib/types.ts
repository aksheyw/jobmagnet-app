export interface JobContext {
  job_title: string;
  company_name: string;
  company_domain: string;
  jd_summary: string;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  responsibilities: string[];
  team_context: string;
  location: string;
  career_level:
    | "junior"
    | "mid"
    | "senior"
    | "staff"
    | "principal"
    | "manager"
    | "director"
    | "vp";
  pitch_suggested_stance: "builder" | "analyst" | "customer" | "strategist";
  degraded: boolean;
}

export interface BrandStyle {
  primary: string;
  secondary: string;
  background: string;
  headline_font: string;
  body_font: string;
  mood:
    | "minimal"
    | "editorial"
    | "systematic"
    | "tech-dark"
    | "warm-creative";
  source: "brandfetch" | "codex-fallback";
}

export interface Narrative {
  candidate_name: string;
  headline: string;
  why_im_a_fit: Array<{ bullet: string; metric: string }>;
  about: string;
  cover_letter: string;
  resume_bullets: Array<{
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }>;
}

export interface EvidenceItem {
  type: "screenshot" | "wireframe-svg" | "diagram-svg";
  url: string;
  caption: string;
}

export interface PitchSection {
  stance: "builder" | "analyst" | "customer" | "strategist";
  seed: string;
  title: string;
  problem: string;
  hypothesis: string;
  proposed_solution: string;
  metrics_to_track: string[];
  tradeoffs: string[];
  guardrails: string[];
  evidence: EvidenceItem[];
  confidence: number;
}

export interface CodexUsageRow {
  agent: string;
  tokens_input: number;
  tokens_output: number;
  tokens_cached_input: number;
  tokens_reasoning_output: number;
  duration_ms: number;
  called_at: string;
}

export interface Generation {
  id: string;
  short_id: string;
  job_id: string;
  pitch_reviewed: boolean;
  job_context: JobContext;
  brand_style: BrandStyle;
  narrative: Narrative;
  pitch_section: PitchSection | null;
  zip_url: string | null;
  zip_size_bytes: number | null;
  zip_generated_at: string | null;
  created_at: string;
  download_count: number;
  codex_usage?: CodexUsageRow[];
}

export type AgentState = "queued" | "running" | "done" | "failed";

export interface AgentStatus {
  state: AgentState;
  started_at?: string;
  completed_at?: string;
  [key: string]: unknown;
}

export interface Job {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  agent_states: Record<string, AgentStatus>;
  agent_started_at: string | null;
  agent_completed_at: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  pitch_stance: string | null;
  short_id?: string;
}
