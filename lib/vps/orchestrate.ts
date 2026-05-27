const VPS_BASE_URL = process.env.VPS_BASE_URL ?? "https://jobmagnet-codex.aksheywalia.in";

export interface OrchestrateRequestBody {
  job_id: string;
  short_id: string;
  jd_url?: string;
  jd_paste_text?: string;
  parsed_profile: Record<string, unknown>;
  email?: string;
  pitch?: {
    enabled: boolean;
    stance: "builder" | "analyst" | "customer" | "strategist";
    seed: string;
  };
}

export class OrchestrateError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "OrchestrateError";
  }
}

/**
 * Fire-and-forget call to the VPS orchestrator. Returns once the VPS has
 * accepted the job (202). The full 60-120s pipeline runs in the VPS's
 * background; Vercel UI polls `/api/jobs/<job_id>` for progress.
 */
export async function startOrchestration(body: OrchestrateRequestBody): Promise<void> {
  const secret = process.env.VPS_SHARED_SECRET;
  if (!secret) {
    throw new OrchestrateError("VPS_SHARED_SECRET env var is required server-side");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${VPS_BASE_URL}/orchestrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    if (res.status !== 202) {
      const text = await res.text().catch(() => "");
      throw new OrchestrateError(
        `VPS /orchestrate returned ${res.status}: ${text.slice(0, 300)}`,
        res.status,
      );
    }
    // We don't read the body — the 202 is sufficient confirmation.
  } catch (err) {
    if (err instanceof OrchestrateError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new OrchestrateError("VPS /orchestrate accept timed out after 10s");
    }
    throw new OrchestrateError(
      err instanceof Error ? err.message : "VPS /orchestrate call failed",
    );
  } finally {
    clearTimeout(timer);
  }
}
