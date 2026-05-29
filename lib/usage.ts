/**
 * Pure aggregation for the /usage Codex telemetry dashboard.
 *
 * Takes raw `codex_usage` rows (read server-side via the service-role client) and
 * returns an AGGREGATE-ONLY view model. By design the output carries no `job_id`
 * (or any per-row identifier), so rendering it cannot enumerate jobs — this is the
 * data-model half of the F24 fix (the other half drops the anon RLS read policy).
 */

export type AgentName = "research" | "brand" | "narrative" | "pitch" | "code";

/** Canonical pipeline order for display. */
export const AGENT_ORDER: readonly AgentName[] = [
  "research",
  "brand",
  "narrative",
  "pitch",
  "code",
];

/** One row of the `codex_usage` table (shape we read server-side). */
export interface CodexUsageRow {
  agent: string;
  tokens_input: number;
  tokens_output: number;
  tokens_cached_input: number;
  tokens_reasoning_output: number;
  duration_ms: number;
  job_id: string;
  called_at: string;
}

/** Per-agent rollup — no per-row identifiers. */
export interface AgentRollup {
  agent: string;
  calls: number;
  tokensInput: number;
  tokensOutput: number;
  tokensCachedInput: number;
  tokensReasoningOutput: number;
  avgDurationMs: number;
  zeroToken: boolean;
}

/** Aggregate-only dashboard view model — no `job_id` anywhere. */
export interface UsageSummary {
  totalGenerations: number;
  totalCalls: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalTokensCachedInput: number;
  totalTokensReasoningOutput: number;
  avgDurationMs: number;
  firstCall: string | null;
  lastCall: string | null;
  agents: AgentRollup[];
}

/** Numeric columns we sum over. */
type NumericKey =
  | "tokens_input"
  | "tokens_output"
  | "tokens_cached_input"
  | "tokens_reasoning_output"
  | "duration_ms";

/** Coerce a possibly-dirty numeric column to a finite number (defensive). */
const num = (v: number): number => (Number.isFinite(v) ? v : 0);

/** Sum one numeric column across rows, coercing non-finite values to 0. */
const sumBy = (rows: CodexUsageRow[], key: NumericKey): number =>
  rows.reduce((s, r) => s + num(r[key]), 0);

function rollupForAgent(agent: string, rows: CodexUsageRow[]): AgentRollup {
  const tokensInput = sumBy(rows, "tokens_input");
  const tokensOutput = sumBy(rows, "tokens_output");
  return {
    agent,
    calls: rows.length,
    tokensInput,
    tokensOutput,
    tokensCachedInput: sumBy(rows, "tokens_cached_input"),
    tokensReasoningOutput: sumBy(rows, "tokens_reasoning_output"),
    avgDurationMs: rows.length ? Math.round(sumBy(rows, "duration_ms") / rows.length) : 0,
    zeroToken: tokensInput + tokensOutput === 0,
  };
}

/** Order agents canonically, with any unknown agent names appended alphabetically. */
function orderAgents(present: Set<string>): string[] {
  const known = AGENT_ORDER.filter((a) => present.has(a));
  const unknown = [...present]
    .filter((a) => !AGENT_ORDER.includes(a as AgentName))
    .sort();
  return [...known, ...unknown];
}

export function aggregateUsage(rows: CodexUsageRow[]): UsageSummary {
  const totalCalls = rows.length;

  const byAgent = new Map<string, CodexUsageRow[]>();
  for (const r of rows) {
    const list = byAgent.get(r.agent) ?? [];
    list.push(r);
    byAgent.set(r.agent, list);
  }

  const calledAts = rows.map((r) => r.called_at).filter(Boolean);

  return {
    totalGenerations: new Set(rows.map((r) => r.job_id)).size,
    totalCalls,
    totalTokensInput: sumBy(rows, "tokens_input"),
    totalTokensOutput: sumBy(rows, "tokens_output"),
    totalTokensCachedInput: sumBy(rows, "tokens_cached_input"),
    totalTokensReasoningOutput: sumBy(rows, "tokens_reasoning_output"),
    avgDurationMs: totalCalls ? Math.round(sumBy(rows, "duration_ms") / totalCalls) : 0,
    firstCall: calledAts.length ? calledAts.reduce((a, b) => (a < b ? a : b)) : null,
    lastCall: calledAts.length ? calledAts.reduce((a, b) => (a > b ? a : b)) : null,
    agents: orderAgents(new Set(rows.map((r) => r.agent))).map((agent) =>
      rollupForAgent(agent, byAgent.get(agent) ?? []),
    ),
  };
}
