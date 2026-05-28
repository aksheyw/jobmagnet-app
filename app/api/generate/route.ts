import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { generateShortId } from "@/lib/short-id";
import { startOrchestration, OrchestrateError } from "@/lib/vps/orchestrate";

export const runtime = "nodejs";
export const maxDuration = 30;

const PitchSchema = z.object({
  enabled: z.boolean(),
  stance: z.enum(["builder", "analyst", "customer", "strategist"]),
  seed: z.string().min(1).max(400),
});

const BodySchema = z
  .object({
    jd_url: z.string().url().optional(),
    jd_paste_text: z.string().min(40).max(50_000).optional(),
    // F82: bound the jsonb-written profile blob. A legit profile is small
    // ({ raw_text, name?, contact?, email?, work_history? }); these caps stop a
    // malicious client from writing an oversized/pathological object to Supabase.
    parsed_profile: z
      .record(z.string().max(120), z.unknown())
      .refine((o) => Object.keys(o).length <= 60, {
        message: "parsed_profile has too many fields",
      })
      .refine(
        (o) => {
          try {
            // Generous ceiling: the real abuse guard is the key-count + key-length
            // caps above. A long LinkedIn paste + many work entries must still pass.
            return JSON.stringify(o).length <= 400_000;
          } catch {
            return false;
          }
        },
        { message: "parsed_profile payload too large" },
      ),
    email: z.string().email().optional(),
    pitch: PitchSchema.optional(),
  })
  .refine((v) => Boolean(v.jd_url) || Boolean(v.jd_paste_text), {
    message: "jd_url or jd_paste_text required",
  });

/**
 * POST /api/generate — kicks off a full 5-agent generation.
 *
 * 1. Validates input
 * 2. Creates a `generation_jobs` row (status='queued')
 * 3. Calls VPS `/orchestrate` (fire-and-forget; returns 202)
 * 4. Returns { job_id, short_id } so the client can navigate to
 *    `/jobs/<job_id>/progress` immediately.
 *
 * The actual 60-120s pipeline runs on the VPS and writes results back to
 * Supabase. The client polls `/api/jobs/<job_id>` for progress.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid request body",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdmin();
  const shortId = generateShortId(10);

  const { data: job, error: insertErr } = await supabase
    .from("generation_jobs")
    .insert({
      anonymous_email: parsed.data.email ?? null,
      parsed_profile: parsed.data.parsed_profile,
      jd_url: parsed.data.jd_url ?? null,
      jd_paste_text: parsed.data.jd_paste_text ?? null,
      jd_input: parsed.data.jd_url ? "url" : "paste",
      pitch_stance: parsed.data.pitch?.stance ?? null,
      pitch_seed: parsed.data.pitch?.seed ?? null,
      status: "queued",
    })
    .select("id")
    .single();

  if (insertErr || !job) {
    console.error("generation_jobs insert failed", insertErr);
    return NextResponse.json(
      { ok: false, error: "failed to create generation job" },
      { status: 500 },
    );
  }

  try {
    await startOrchestration({
      job_id: job.id,
      short_id: shortId,
      jd_url: parsed.data.jd_url,
      jd_paste_text: parsed.data.jd_paste_text,
      parsed_profile: parsed.data.parsed_profile,
      email: parsed.data.email,
      pitch: parsed.data.pitch,
    });
  } catch (err) {
    // VPS couldn't accept — mark the job failed so the client doesn't poll forever.
    console.error("startOrchestration failed", err);
    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error:
          err instanceof OrchestrateError
            ? err.message.slice(0, 500)
            : "orchestrator unreachable",
      })
      .eq("id", job.id)
      .then(undefined, () => undefined);

    return NextResponse.json(
      { ok: false, error: "agent runtime unavailable" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    job_id: job.id,
    short_id: shortId,
  });
}
