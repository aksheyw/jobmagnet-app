"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AgentProgressRow } from "@/components/editor/AgentProgressRow";
import type { Job, AgentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then((p) => setJobId(p.job_id));
  }, [params]);

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

  const agentStates = job?.agent_states ?? {};

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600" />
          <span className="text-sm font-semibold text-slate-800">
            JobMagnet
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              Codex agents running
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Generating your portfolio…
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Usually done in under 60 seconds
            </p>
          </div>

          {/* Agent rows */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
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
          <p className="text-center text-xs text-slate-400">
            Running on Akshey&apos;s ChatGPT Plus via the Codex SDK. Zero API
            spend.
          </p>

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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-xl">✕</span>
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
