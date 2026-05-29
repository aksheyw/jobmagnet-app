import Link from "next/link";
import type { UsageSummary, AgentRollup } from "@/lib/usage";

/** Human label + one-line role for each agent (presentation only). */
const AGENT_META: Record<string, { label: string; role: string }> = {
  research: { label: "Research", role: "Reads the JD → structured JobContext · web_search" },
  brand: { label: "Brand", role: "Company colors + fonts · Brandfetch → Codex fallback" },
  narrative: { label: "Narrative", role: "Tailored résumé + cover · structured output" },
  pitch: { label: "Pitch", role: "PM-RFC product critique + SVG · web_search + sandbox" },
  code: { label: "Code", role: "Builds + zips the Next.js site · deterministic" },
};

const compact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
};

const full = (n: number): string => n.toLocaleString("en-US");

const duration = (ms: number): string =>
  ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;

function StatCard({
  value,
  label,
  sublabel,
  accent,
}: {
  value: string;
  label: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${
        accent ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-200"
      }`}
    >
      <div
        className={`text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${
          accent ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      {sublabel ? <div className="mt-0.5 text-xs text-slate-500">{sublabel}</div> : null}
    </div>
  );
}

function AgentRow({ a, maxInput }: { a: AgentRollup; maxInput: number }) {
  const meta = AGENT_META[a.agent] ?? { label: a.agent, role: "" };
  const barPct = maxInput > 0 ? Math.round((a.tokensInput / maxInput) * 100) : 0;
  return (
    <div className="grid grid-cols-2 items-center gap-3 px-5 py-4 sm:grid-cols-12">
      {/* Agent name + role */}
      <div className="col-span-2 sm:col-span-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
          {a.zeroToken ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              0 LLM tokens
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{meta.role}</p>
      </div>

      {/* Calls */}
      <div className="sm:col-span-1 sm:text-right">
        <div className="text-sm font-medium tabular-nums text-slate-900">{a.calls}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500 sm:hidden">calls</div>
      </div>

      {/* Input tokens + bar */}
      <div className="sm:col-span-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 sm:hidden">in</span>
          <span className="text-sm font-medium tabular-nums text-slate-900">
            {a.zeroToken ? "—" : compact(a.tokensInput)}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${barPct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Output */}
      <div className="sm:col-span-1 sm:text-right">
        <div className="text-sm tabular-nums text-slate-600">
          {a.zeroToken ? "—" : compact(a.tokensOutput)}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500 sm:hidden">out</div>
      </div>

      {/* Avg time */}
      <div className="sm:col-span-2 sm:text-right">
        <div className="text-sm tabular-nums text-slate-600">{duration(a.avgDurationMs)}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500 sm:hidden">avg</div>
      </div>
    </div>
  );
}

export function UsageDashboard({ summary }: { summary: UsageSummary }) {
  const tokensProcessed = summary.totalTokensInput + summary.totalTokensOutput;
  const maxInput = summary.agents.reduce((m, a) => Math.max(m, a.tokensInput), 0);
  const zeroTokenCount = summary.agents.filter((a) => a.zeroToken).length;

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {/* Header */}
        <header className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Codex usage · live telemetry
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built by five Codex agents.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Every JobMagnet portfolio is generated by a pipeline of five OpenAI Codex SDK agents.
            These are the real, measured token and time numbers from every generation — logged to
            Supabase and aggregated live.
          </p>
        </header>

        {/* Stat band */}
        <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard value={full(summary.totalGenerations)} label="Generations" />
          <StatCard value={full(summary.totalCalls)} label="Agent calls" />
          <StatCard value={compact(tokensProcessed)} label="Tokens processed" sublabel="input + output" />
          <StatCard value={duration(summary.avgDurationMs)} label="Avg / call" />
          <StatCard value="$0" label="Token cost" sublabel="ChatGPT Plus OAuth" accent />
        </section>

        {/* Per-agent pipeline */}
        <section className="mt-12">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            The five-agent pipeline
          </h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* Column header (desktop only) */}
            <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <div className="col-span-5">Agent</div>
              <div className="col-span-1 text-right">Calls</div>
              <div className="col-span-3">Tokens in</div>
              <div className="col-span-1 text-right">Out</div>
              <div className="col-span-2 text-right">Avg time</div>
            </div>
            <div className="divide-y divide-slate-100">
              {summary.agents.map((a) => (
                <AgentRow key={a.agent} a={a} maxInput={maxInput} />
              ))}
            </div>
          </div>
        </section>

        {/* Efficiency callouts */}
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold tabular-nums text-slate-900">
              {zeroTokenCount} of {summary.agents.length} agents
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              run on <span className="font-medium text-slate-700">0 LLM tokens</span> — Code is
              deterministic, Brand resolves from Brandfetch.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold tabular-nums text-slate-900">
              {compact(summary.totalTokensCachedInput)} cached
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              input tokens served from Codex prompt caching across the pipeline.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold tabular-nums text-slate-900">
              {compact(summary.totalTokensReasoningOutput)} reasoning
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              output tokens spent by Codex reasoning while planning each generation.
            </p>
          </div>
        </section>

        {/* Footnote */}
        <footer className="mt-10 text-center text-xs leading-relaxed text-slate-500">
          Live from Supabase <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">codex_usage</code> ·
          aggregate-only (no per-job data) · generations run on the Codex CLI&apos;s ChatGPT Plus OAuth,
          so token cost is $0.
          <span className="mt-2 block">
            <Link href="/gallery" className="font-medium text-indigo-600 hover:text-indigo-700">
              See the brand gallery →
            </Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
