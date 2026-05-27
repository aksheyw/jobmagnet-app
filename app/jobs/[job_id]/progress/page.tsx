"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AgentProgressRow } from "@/components/editor/AgentProgressRow";
import type { Job, AgentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wordmark } from "@/components/brand/BrandMark";

const AGENT_ORDER = ["research", "brand", "narrative", "pitch", "code"];

type AgentState = "queued" | "running" | "done" | "failed";

function resolveAgentState(agentStatus: AgentStatus | undefined): AgentState {
  if (!agentStatus) return "queued";
  const s = agentStatus.state;
  if (s === "running") return "running";
  if (s === "done") return "done";
  if (s === "failed") return "failed";
  return "queued";
}

function computeDurationMs(
  agentStatus: AgentStatus | undefined,
): number | undefined {
  if (!agentStatus?.started_at || !agentStatus?.completed_at) return undefined;
  const start = new Date(agentStatus.started_at as string).getTime();
  const end = new Date(agentStatus.completed_at as string).getTime();
  return Math.max(0, end - start);
}

interface ProgressPageProps {
  readonly params: Promise<{ job_id: string }>;
}

export default function ProgressPage({ params }: ProgressPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobId, setJobId] = useState<string>("");
  const [job, setJob] = useState<Job | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then((p) => setJobId(p.job_id));
  }, [params]);

  // Wall-clock ticker for live elapsed
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as {
          ok: boolean;
          job?: Job;
          error?: string;
        };
        if (!data.ok || !data.job) {
          setFetchError(data.error ?? "Failed to load job status.");
          return;
        }
        setJob(data.job);

        if (data.job.status === "completed") {
          const sid =
            data.job.short_id ?? searchParams.get("short_id") ?? "";
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace(`/edit/${sid}`);
        }
        if (data.job.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        setFetchError("Network error while polling job status.");
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, router, searchParams]);

  const agentStates = useMemo(() => job?.agent_states ?? {}, [job]);

  const completedAgents = useMemo(
    () =>
      AGENT_ORDER.filter(
        (a) => resolveAgentState(agentStates[a] as AgentStatus | undefined) === "done",
      ).length,
    [agentStates],
  );

  const runningAgent = useMemo(
    () =>
      AGENT_ORDER.find(
        (a) =>
          resolveAgentState(agentStates[a] as AgentStatus | undefined) ===
          "running",
      ) ?? null,
    [agentStates],
  );

  const elapsedSec = Math.max(0, Math.floor((now - startedAt) / 1000));
  const progressPct = Math.min(
    100,
    Math.round((completedAgents / AGENT_ORDER.length) * 100),
  );

  if (notFound) {
    return (
      <ErrorState
        title="Job not found"
        message="This job ID doesn't exist or has expired."
      />
    );
  }

  if (fetchError) {
    return <ErrorState title="Something went wrong" message={fetchError} />;
  }

  if (job?.status === "failed") {
    return (
      <ErrorState
        title="Generation failed"
        message={job.error ?? "An unknown error occurred."}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" aria-label="JobMagnet home">
          <Wordmark size="sm" />
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:
          {String(elapsedSec % 60).padStart(2, "0")}
        </span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-7">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Codex agents running
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Generating your portfolio…
            </h1>
            <p className="text-sm text-slate-500">
              {runningAgent ? (
                <>
                  Currently:{" "}
                  <span className="font-medium text-slate-700">
                    {runningAgent} agent
                  </span>{" "}
                  &middot; usually done in under 96 seconds
                </>
              ) : (
                <>Usually done in under 96 seconds</>
              )}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>
                <span className="font-semibold text-slate-700">
                  {completedAgents}
                </span>{" "}
                / {AGENT_ORDER.length} agents done
              </span>
              <span className="font-mono tabular-nums">{progressPct}%</span>
            </div>
            <div
              className="h-2 rounded-full bg-slate-100 overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Agent rows */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {AGENT_ORDER.map((agent) => {
              const status = agentStates[agent] as AgentStatus | undefined;
              const state = resolveAgentState(status);
              const durationMs = computeDurationMs(status);
              return (
                <AgentProgressRow
                  key={agent}
                  agent={agent}
                  state={state}
                  durationMs={durationMs}
                />
              );
            })}
          </div>

          {/* Reassurance */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Your profile + JD are processed once, then{" "}
              <span className="font-medium text-slate-700">deleted</span>. The
              portfolio is{" "}
              <span className="font-medium text-slate-700">yours to keep</span>{" "}
              — no account, no lock-in, no ongoing cost.
            </p>
          </div>

          {!job && (
            <div className="text-center">
              <p className="text-xs text-slate-400 animate-pulse">
                Connecting to job queue…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  title,
  message,
}: {
  readonly title: string;
  readonly message: string;
}) {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl" aria-hidden>
            ✕
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{message}</p>
        <Link href="/start" className={cn(buttonVariants())}>
          Try again &rarr;
        </Link>
      </div>
    </div>
  );
}
