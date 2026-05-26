import { NextResponse } from "next/server";
import { z } from "zod";
import { callVpsAgent, VpsClientError } from "@/lib/vps/client";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z
  .object({
    jd_url: z.string().url().optional(),
    jd_paste_text: z.string().min(40).optional(),
    job_id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional(),
  })
  .refine((v) => v.jd_url || v.jd_paste_text, {
    message: "Provide jd_url or jd_paste_text",
  });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const parseResult = BodySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { ok: false, error: "invalid request body", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { jd_url, jd_paste_text, job_id } = parseResult.data;
  const id = job_id ?? `web-${crypto.randomUUID()}`;

  try {
    const vpsResponse = await callVpsAgent({
      agent: "research",
      jobId: id,
      inputs: jd_url ? { jd_url } : { jd_paste_text },
      timeoutMs: 90_000,
    });

    return NextResponse.json({
      ok: true,
      job_id: id,
      result: vpsResponse.result,
      usage: vpsResponse.usage,
      durationMs: vpsResponse.durationMs,
      webSearchQueries: vpsResponse.webSearchQueries,
    });
  } catch (err) {
    // Map upstream errors to clean public responses without leaking VPS
    // internals (paths, env var names, SDK stack frames). Detailed logging
    // happens server-side via console.error.
    console.error("research route failed", {
      job_id: id,
      err: err instanceof Error ? { name: err.name, message: err.message } : err,
    });

    if (err instanceof VpsClientError) {
      // 4xx from VPS (validation, SSRF reject, agent-not-implemented) → propagate
      // the user-facing status with a tidy generic message. Real detail is logged.
      if (err.status && err.status >= 400 && err.status < 500) {
        return NextResponse.json(
          { ok: false, job_id: id, error: "request rejected by agent runtime" },
          { status: err.status },
        );
      }
    }

    return NextResponse.json(
      { ok: false, job_id: id, error: "research agent failed" },
      { status: 502 },
    );
  }
}
