import { describe, it, expect } from "vitest";
import { aggregateUsage, type CodexUsageRow } from "./usage";

const row = (over: Partial<CodexUsageRow> = {}): CodexUsageRow => ({
  agent: "research",
  tokens_input: 0,
  tokens_output: 0,
  tokens_cached_input: 0,
  tokens_reasoning_output: 0,
  duration_ms: 0,
  job_id: "job-1",
  called_at: "2026-05-26T00:00:00Z",
  ...over,
});

describe("aggregateUsage — totals", () => {
  it("returns all-zero summary for empty input", () => {
    const s = aggregateUsage([]);
    expect(s.totalGenerations).toBe(0);
    expect(s.totalCalls).toBe(0);
    expect(s.totalTokensInput).toBe(0);
    expect(s.totalTokensOutput).toBe(0);
    expect(s.totalTokensCachedInput).toBe(0);
    expect(s.totalTokensReasoningOutput).toBe(0);
    expect(s.avgDurationMs).toBe(0);
    expect(s.agents).toEqual([]);
    expect(s.firstCall).toBeNull();
    expect(s.lastCall).toBeNull();
  });

  it("sums token totals across all rows", () => {
    const s = aggregateUsage([
      row({ tokens_input: 100, tokens_output: 10, tokens_cached_input: 5, tokens_reasoning_output: 2 }),
      row({ tokens_input: 200, tokens_output: 20, tokens_cached_input: 15, tokens_reasoning_output: 8 }),
    ]);
    expect(s.totalTokensInput).toBe(300);
    expect(s.totalTokensOutput).toBe(30);
    expect(s.totalTokensCachedInput).toBe(20);
    expect(s.totalTokensReasoningOutput).toBe(10);
    expect(s.totalCalls).toBe(2);
  });

  it("counts distinct job_id as totalGenerations", () => {
    const s = aggregateUsage([
      row({ job_id: "a" }),
      row({ job_id: "a" }),
      row({ job_id: "b" }),
    ]);
    expect(s.totalGenerations).toBe(2);
    expect(s.totalCalls).toBe(3);
  });

  it("computes overall avg duration rounded to an integer", () => {
    const s = aggregateUsage([row({ duration_ms: 100 }), row({ duration_ms: 301 })]);
    expect(s.avgDurationMs).toBe(201); // (100+301)/2 = 200.5 -> 201
  });

  it("reports first and last called_at", () => {
    const s = aggregateUsage([
      row({ called_at: "2026-05-27T10:00:00Z" }),
      row({ called_at: "2026-05-26T09:00:00Z" }),
      row({ called_at: "2026-05-29T08:00:00Z" }),
    ]);
    expect(s.firstCall).toBe("2026-05-26T09:00:00Z");
    expect(s.lastCall).toBe("2026-05-29T08:00:00Z");
  });
});

describe("aggregateUsage — per-agent rollups", () => {
  it("rolls up calls, tokens and avg duration per agent", () => {
    const s = aggregateUsage([
      row({ agent: "pitch", tokens_input: 1000, tokens_output: 100, tokens_reasoning_output: 50, duration_ms: 40000 }),
      row({ agent: "pitch", tokens_input: 500, tokens_output: 50, tokens_reasoning_output: 10, duration_ms: 60000 }),
    ]);
    const pitch = s.agents.find((a) => a.agent === "pitch")!;
    expect(pitch.calls).toBe(2);
    expect(pitch.tokensInput).toBe(1500);
    expect(pitch.tokensOutput).toBe(150);
    expect(pitch.tokensReasoningOutput).toBe(60);
    expect(pitch.avgDurationMs).toBe(50000);
    expect(pitch.zeroToken).toBe(false);
  });

  it("flags agents with zero LLM tokens (code, brand) as zeroToken", () => {
    const s = aggregateUsage([
      row({ agent: "code", tokens_input: 0, tokens_output: 0, duration_ms: 97 }),
      row({ agent: "brand", tokens_input: 0, tokens_output: 0, duration_ms: 606 }),
    ]);
    expect(s.agents.find((a) => a.agent === "code")!.zeroToken).toBe(true);
    expect(s.agents.find((a) => a.agent === "brand")!.zeroToken).toBe(true);
  });

  it("orders agents canonically (research, brand, narrative, pitch, code) regardless of input order", () => {
    const s = aggregateUsage([
      row({ agent: "code" }),
      row({ agent: "pitch" }),
      row({ agent: "research" }),
      row({ agent: "narrative" }),
      row({ agent: "brand" }),
    ]);
    expect(s.agents.map((a) => a.agent)).toEqual([
      "research",
      "brand",
      "narrative",
      "pitch",
      "code",
    ]);
  });

  it("only includes agents that appear in the data", () => {
    const s = aggregateUsage([row({ agent: "research" }), row({ agent: "code" })]);
    expect(s.agents.map((a) => a.agent)).toEqual(["research", "code"]);
  });
});

describe("aggregateUsage — F24 (no job_id leakage)", () => {
  it("never exposes job_id in the summary or any agent rollup", () => {
    const s = aggregateUsage([
      row({ job_id: "secret-job-uuid-123", agent: "research" }),
      row({ job_id: "secret-job-uuid-456", agent: "pitch" }),
    ]);
    const serialized = JSON.stringify(s);
    expect(serialized).not.toContain("job_id");
    expect(serialized).not.toContain("secret-job-uuid");
    // and no agent rollup carries a job id field
    for (const a of s.agents) {
      expect(Object.keys(a)).not.toContain("job_id");
    }
  });
});
