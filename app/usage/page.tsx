import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { aggregateUsage, type CodexUsageRow } from "@/lib/usage";
import { UsageDashboard } from "@/components/usage/UsageDashboard";

export const metadata: Metadata = {
  title: "Codex usage — JobMagnet",
  description:
    "Live token + time telemetry from JobMagnet's five-agent OpenAI Codex SDK pipeline. Aggregate-only.",
};

// Always render fresh so the numbers reflect the latest generations.
export const dynamic = "force-dynamic";

// Safety cap on the telemetry read. At hackathon scale (~5 rows / generation) this
// is never reached; it bounds a runaway full-table scan on every request. The
// production-grade fix is to push SUM/COUNT down into Postgres via an RPC instead
// of aggregating in the app — deferred (see wiki).
const USAGE_ROW_CAP = 50_000;

// Read happens server-side via the service-role client; `job_id` is used only to
// count distinct generations and is never returned in the aggregate view (F24).
async function fetchUsageRows(): Promise<CodexUsageRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("codex_usage")
    .select(
      "agent, tokens_input, tokens_output, tokens_cached_input, tokens_reasoning_output, duration_ms, job_id, called_at",
    )
    .order("called_at", { ascending: false })
    .limit(USAGE_ROW_CAP);
  if (error) throw new Error(`Failed to load codex_usage: ${error.message}`);
  return (data ?? []) as CodexUsageRow[];
}

function CenteredNote({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Codex usage
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{body}</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to JobMagnet
        </Link>
      </div>
    </main>
  );
}

export default async function UsagePage() {
  let rows: CodexUsageRow[];
  try {
    rows = await fetchUsageRows();
  } catch {
    // Degrade gracefully — a telemetry read error must not 500 the page.
    // (Server-side observability via Sentry is deferred — see wiki F22.)
    return (
      <CenteredNote
        title="Telemetry temporarily unavailable"
        body="We couldn't load the usage numbers right now. Please try again in a moment."
      />
    );
  }

  const summary = aggregateUsage(rows);
  if (summary.totalCalls === 0) {
    return (
      <CenteredNote
        title="No generations logged yet"
        body="Once a portfolio is generated, every Codex agent call shows up here with its token and time cost."
      />
    );
  }

  return <UsageDashboard summary={summary} />;
}
