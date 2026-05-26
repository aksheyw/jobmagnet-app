"use client";

import { useEffect, useState } from "react";

export type AgentState = "queued" | "running" | "done" | "failed";

interface AgentProgressRowProps {
  readonly agent: string;
  readonly state: AgentState;
  readonly durationMs?: number;
  readonly extra?: Record<string, unknown>;
}

const AGENT_META: Record<
  string,
  { label: string; caption: string; icon: string }
> = {
  research: {
    label: "ResearchSage",
    caption: "Fetching job context, company signals, and JD structure",
    icon: "🔍",
  },
  brand: {
    label: "BrandSage",
    caption: "Pulling brand colors and fonts from Brandfetch",
    icon: "🎨",
  },
  narrative: {
    label: "NarrativeSage",
    caption: "Writing your headline, about section, and cover letter",
    icon: "✍️",
  },
  pitch: {
    label: "PitchSage",
    caption: "Building your PM-style pitch deck",
    icon: "💡",
  },
  code: {
    label: "CodeSage",
    caption: "Generating and zipping your portfolio site",
    icon: "⚙️",
  },
};

function getDefaultMeta(agent: string) {
  return (
    AGENT_META[agent.toLowerCase()] ?? {
      label: agent,
      caption: "Processing…",
      icon: "⚡",
    }
  );
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StateDot({ state, visible }: { state: AgentState; visible: boolean }) {
  if (!visible) {
    return (
      <span
        aria-label="queued"
        className="h-2.5 w-2.5 rounded-full bg-slate-200 flex-shrink-0"
      />
    );
  }
  if (state === "running") {
    return (
      <span
        aria-label="running"
        className="relative flex h-2.5 w-2.5 flex-shrink-0"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
      </span>
    );
  }
  if (state === "done") {
    return (
      <span
        aria-label="done"
        className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-in zoom-in-50 duration-300"
      />
    );
  }
  if (state === "failed") {
    return (
      <span
        aria-label="failed"
        className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0"
      />
    );
  }
  return (
    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 flex-shrink-0" />
  );
}

export function AgentProgressRow({
  agent,
  state,
  durationMs,
}: AgentProgressRowProps) {
  const meta = getDefaultMeta(agent);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (state !== "queued") {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const visible = state !== "queued" || mounted;

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-300 ${
        state === "running" ? "bg-blue-50" : ""
      } ${state === "done" ? "bg-emerald-50/50" : ""} ${
        state === "failed" ? "bg-red-50" : ""
      }`}
    >
      <StateDot state={state} visible={visible} />

      <span className="text-base leading-none flex-shrink-0" aria-hidden>
        {meta.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{meta.label}</p>
        <p className="text-xs text-slate-400 truncate">{meta.caption}</p>
      </div>

      <div className="flex-shrink-0 text-right">
        {state === "done" && durationMs !== undefined && (
          <span className="text-xs text-emerald-600 font-medium">
            {formatDuration(durationMs)}
          </span>
        )}
        {state === "running" && (
          <span className="text-xs text-blue-500 font-medium">running…</span>
        )}
        {state === "failed" && (
          <span className="text-xs text-red-500 font-medium">failed</span>
        )}
        {state === "queued" && (
          <span className="text-xs text-slate-300">queued</span>
        )}
      </div>
    </div>
  );
}
