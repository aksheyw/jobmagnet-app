import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SHORT_ID_REGEX = /^[a-zA-Z0-9_-]{4,32}$/;

// Bounds on every field so a crafted edit POST can't write an unbounded
// payload into the jsonb column, and the evidence URL is restricted to safe
// schemes (data:image SVG or http(s)) so a javascript:/other-scheme URI can't
// be stored and later rendered as a clickable link in the editor.
const EvidenceItemSchema = z.object({
  type: z.enum(["screenshot", "wireframe-svg", "diagram-svg"]),
  url: z
    .string()
    .min(1)
    .max(20000)
    .refine((u) => /^(https?:|data:image\/)/i.test(u), {
      message: "evidence url must be an http(s) link or a data:image URI",
    }),
  caption: z.string().min(1).max(500),
});

const PitchSectionSchema = z.object({
  stance: z.enum(["builder", "analyst", "customer", "strategist"]),
  seed: z.string().max(400),
  title: z.string().min(1).max(300),
  problem: z.string().min(1).max(2000),
  hypothesis: z.string().max(2000),
  proposed_solution: z.string().min(1).max(2000),
  metrics_to_track: z.array(z.string().max(500)).max(20),
  tradeoffs: z.array(z.string().max(500)).max(20),
  guardrails: z.array(z.string().max(500)).max(20),
  evidence: z.array(EvidenceItemSchema).max(6),
  confidence: z.number().min(0).max(1),
});

const BodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    edits: PitchSectionSchema.partial().optional(),
  }),
  z.object({ action: z.literal("skip") }),
]);

/**
 * POST /api/generations/<short_id>/pitch — approve or skip the pitch.
 *
 * - approve: marks pitch_reviewed=true; optionally accepts an `edits` patch
 *   that's merged into the existing pitch_section before save.
 * - skip:    sets pitch_section=null and pitch_reviewed=true.
 *
 * Either action unlocks the Download button (PitchAgent hard gate).
 *
 * NOTE: This endpoint currently has NO auth — anyone with the short_id can
 * flip pitch_reviewed. That's acceptable for the MVP demo (the short_id is
 * effectively a bearer token). Day 4 Final adds device-token / magic-link
 * auth per spec §18.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ short_id: string }> },
) {
  const { short_id } = await params;
  if (!SHORT_ID_REGEX.test(short_id)) {
    return NextResponse.json(
      { ok: false, error: "invalid short_id" },
      { status: 400 },
    );
  }

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
      { ok: false, error: "invalid pitch action", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: current } = await supabase
    .from("generations")
    .select("id, pitch_section, pitch_reviewed, deleted_at")
    .eq("short_id", short_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return NextResponse.json(
      { ok: false, error: "generation not found" },
      { status: 404 },
    );
  }

  if (parsed.data.action === "skip") {
    const { error } = await supabase
      .from("generations")
      .update({ pitch_section: null, pitch_reviewed: true })
      .eq("id", current.id);
    if (error) {
      console.error("pitch skip update failed", error);
      return NextResponse.json(
        { ok: false, error: "failed to skip pitch" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, action: "skipped" });
  }

  // approve (with optional edits)
  const existing = current.pitch_section as Record<string, unknown> | null;
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "no pitch to approve" },
      { status: 400 },
    );
  }

  const merged = parsed.data.edits ? { ...existing, ...parsed.data.edits } : existing;

  const { error } = await supabase
    .from("generations")
    .update({ pitch_section: merged, pitch_reviewed: true })
    .eq("id", current.id);

  if (error) {
    console.error("pitch approve update failed", error);
    return NextResponse.json(
      { ok: false, error: "failed to approve pitch" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, action: "approved" });
}
