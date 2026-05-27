import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { CodexUsageRow } from "@/lib/types";

export const runtime = "nodejs";

const SHORT_ID_REGEX = /^[a-zA-Z0-9_-]{4,32}$/;

/**
 * GET /api/generations/<short_id> — return the full generated content for
 * the framed editor + iframe preview.
 *
 * Anyone with the short_id can read (it's a 10-char URL-safe slug; ~10^16
 * keyspace). PII fields (anonymous_email) are NOT returned. Soft-deleted
 * rows (deleted_at IS NOT NULL) return 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ short_id: string }> },
) {
  const { short_id } = await params;
  if (!SHORT_ID_REGEX.test(short_id)) {
    return NextResponse.json(
      { ok: false, error: "invalid short_id" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: gen, error } = await supabase
    .from("generations")
    .select(
      "id, short_id, job_id, pitch_reviewed, job_context, brand_style, narrative, pitch_section, zip_url, zip_size_bytes, zip_generated_at, created_at, download_count, deleted_at",
    )
    .eq("short_id", short_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("generations read failed", error);
    return NextResponse.json(
      { ok: false, error: "failed to read generation" },
      { status: 500 },
    );
  }
  if (!gen) {
    return NextResponse.json(
      { ok: false, error: "generation not found" },
      { status: 404 },
    );
  }

  // Fetch codex_usage rows for "trail of work" sidebar. Non-fatal if it fails.
  let codex_usage: CodexUsageRow[] = [];
  if (gen.job_id) {
    const { data: usage } = await supabase
      .from("codex_usage")
      .select(
        "agent, tokens_input, tokens_output, tokens_cached_input, tokens_reasoning_output, duration_ms, called_at",
      )
      .eq("job_id", gen.job_id)
      .order("called_at", { ascending: true });
    codex_usage = (usage ?? []) as CodexUsageRow[];
  }

  // F67: surface pitch_stance from the originating job so the editor can
  // distinguish "user opted out of pitch" (stance == null) from
  // "user requested pitch but it failed" (stance != null, pitch_section == null).
  let pitch_stance: string | null = null;
  if (gen.job_id) {
    const { data: jobRow } = await supabase
      .from("generation_jobs")
      .select("pitch_stance")
      .eq("id", gen.job_id)
      .maybeSingle();
    pitch_stance = (jobRow?.pitch_stance ?? null) as string | null;
  }

  return NextResponse.json({
    ok: true,
    generation: { ...gen, codex_usage, pitch_stance },
  });
}
