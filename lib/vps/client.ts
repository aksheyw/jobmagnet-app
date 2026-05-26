import { z } from "zod";

const VPS_BASE_URL = process.env.VPS_BASE_URL ?? "https://jobmagnet-codex.aksheywalia.in";

const AgentName = z.enum(["research", "brand", "narrative", "code", "pitch"]);
export type AgentName = z.infer<typeof AgentName>;

const VpsResponseSchema = z.object({
  ok: z.boolean(),
  result: z.unknown().optional(),
  usage: z
    .object({
      input_tokens: z.number(),
      cached_input_tokens: z.number(),
      output_tokens: z.number(),
      reasoning_output_tokens: z.number(),
    })
    .optional(),
  durationMs: z.number().optional(),
  webSearchQueries: z.array(z.string()).optional(),
  agent: z.string().optional(),
  job_id: z.string().optional(),
  error: z.string().optional(),
});

export type VpsResponse = z.infer<typeof VpsResponseSchema>;

export interface CallVpsAgentParams {
  agent: AgentName;
  jobId: string;
  inputs: Record<string, unknown>;
  timeoutMs?: number;
}

export class VpsClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "VpsClientError";
  }
}

export async function callVpsAgent(params: CallVpsAgentParams): Promise<VpsResponse> {
  const secret = process.env.VPS_SHARED_SECRET;
  if (!secret) {
    throw new VpsClientError("VPS_SHARED_SECRET env var is required server-side");
  }

  const timeoutMs = params.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${VPS_BASE_URL}/run-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        agent: params.agent,
        job_id: params.jobId,
        inputs: params.inputs,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new VpsClientError(`VPS returned HTTP ${res.status}: ${text.slice(0, 500)}`, res.status);
    }

    const data = await res.json();
    const parsed = VpsResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new VpsClientError(`VPS response schema mismatch: ${parsed.error.message}`);
    }

    if (!parsed.data.ok) {
      throw new VpsClientError(`VPS agent ${params.agent} failed: ${parsed.data.error ?? "unknown"}`);
    }

    return parsed.data;
  } catch (err) {
    if (err instanceof VpsClientError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new VpsClientError(`VPS call timed out after ${timeoutMs}ms`, undefined, err);
    }
    throw new VpsClientError(
      err instanceof Error ? err.message : "VPS call failed",
      undefined,
      err,
    );
  } finally {
    clearTimeout(timer);
  }
}
