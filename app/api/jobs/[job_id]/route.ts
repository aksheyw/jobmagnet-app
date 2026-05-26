import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/jobs/<job_id> — return current status of a generation job.
 *
 * Used by the progress page to poll every ~2s until status === "completed"
 * (then redirect to /edit/<short_id>) or "failed" (show error UI).
 *
 * Public read by design — job_id is a UUID and not enumerable. No PII
 * in the returned payload (anonymous_email is OMITTED from the SELECT).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> },
) {
  const { job_id } = await params;
  if (!UUID_REGEX.test(job_id)) {
    return NextResponse.json(
      { ok: false, error: "invalid job_id" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: job, error: jobErr } = await supabase
    .from("generation_jobs")
    .select(
      "id, status, agent_states, agent_started_at, agent_completed_at, error, created_at, completed_at, pitchsage_stance",
    )
    .eq("id", job_id)
    .maybeSingle();

  if (jobErr) {
    console.error("jobs status read failed", jobErr);
    return NextResponse.json(
      { ok: false, error: "failed to read job status" },
      { status: 500 },
    );
  }
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "job not found" },
      { status: 404 },
    );
  }

  // If the job is completed, also surface the short_id so the client can navigate.
  let short_id: string | null = null;
  if (job.status === "completed") {
    const { data: gen } = await supabase
      .from("generations")
      .select("short_id")
      .eq("job_id", job_id)
      .maybeSingle();
    short_id = gen?.short_id ?? null;
  }

  return NextResponse.json({
    ok: true,
    job: {
      id: job.id,
      status: job.status,
      agent_states: job.agent_states,
      agent_started_at: job.agent_started_at,
      agent_completed_at: job.agent_completed_at,
      error: job.error,
      created_at: job.created_at,
      completed_at: job.completed_at,
      pitchsage_stance: job.pitchsage_stance,
      short_id,
    },
  });
}
