"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    key: "research",
    label: "Research agent",
    caption: "Reading the JD",
    icon: "🔍",
    duration: 1600,
  },
  {
    key: "brand",
    label: "Brand agent",
    caption: "Pulling brand colors + fonts",
    icon: "🎨",
    duration: 1100,
  },
  {
    key: "narrative",
    label: "Narrative agent",
    caption: "Writing your story",
    icon: "✍️",
    duration: 2200,
  },
  {
    key: "pitch",
    label: "Pitch agent",
    caption: "Drafting your PM-style pitch",
    icon: "💡",
    duration: 2400,
  },
  {
    key: "code",
    label: "Code agent",
    caption: "Generating Next.js + zipping",
    icon: "⚙️",
    duration: 1300,
  },
];

const TOTAL_MS = AGENTS.reduce((a, x) => a + x.duration, 0);

type AgentState = "queued" | "running" | "done";

export function LandingDemo() {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // Animation loop: reset and step through each agent with timers.
    // The cycle-driven reset is intentional; suppressing the lint rule here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(-1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(0);

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let acc = 600;

    AGENTS.forEach((a, idx) => {
      timers.push(
        setTimeout(() => {
          setActiveIdx(idx);
        }, acc),
      );
      acc += a.duration;
    });

    timers.push(
      setTimeout(() => {
        setActiveIdx(AGENTS.length);
      }, acc),
    );

    timers.push(
      setTimeout(() => {
        setCycle((c) => c + 1);
      }, acc + 2400),
    );

    const ticker = setInterval(() => {
      setElapsed((e) => Math.min(TOTAL_MS, e + 80));
    }, 80);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      clearInterval(ticker);
    };
  }, [cycle]);

  function stateFor(idx: number): AgentState {
    if (activeIdx === -1) return "queued";
    if (idx < activeIdx) return "done";
    if (idx === activeIdx) return "running";
    return "queued";
  }

  const seconds = Math.min(96, Math.round((elapsed / TOTAL_MS) * 96));

  return (
    <div className="relative">
      {/* Glow */}
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-200/40 via-violet-100/30 to-amber-100/40 blur-2xl"
        aria-hidden
      />

      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Browser-chrome top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2">
            <div className="rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 font-mono truncate text-center">
              jobmagnet.app
              <span className="text-slate-300">/jobs/live</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {seconds}s
          </span>
        </div>

        {/* Live agent pipeline */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {activeIdx >= AGENTS.length
                  ? "Portfolio ready"
                  : "Codex agents running"}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {activeIdx >= AGENTS.length
                ? "5 / 5 done"
                : `${Math.max(0, activeIdx)} / 5`}
            </span>
          </div>

          <div className="space-y-1.5">
            {AGENTS.map((a, idx) => {
              const s = stateFor(idx);
              return (
                <div
                  key={a.key}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-500",
                    s === "running" && "bg-indigo-50 ring-1 ring-indigo-100",
                    s === "done" && "bg-emerald-50/60",
                    s === "queued" && "bg-slate-50/50 opacity-50",
                  )}
                >
                  <span className="text-base flex-shrink-0" aria-hidden>
                    {a.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {a.label}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight truncate">
                      {a.caption}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {s === "running" && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] text-indigo-600 font-medium">
                          running
                        </span>
                      </span>
                    )}
                    {s === "done" && (
                      <svg
                        className="h-4 w-4 text-emerald-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.296a1 1 0 0 1 0 1.408l-7.999 8a1 1 0 0 1-1.41 0l-4-4a1 1 0 1 1 1.41-1.408l3.295 3.293 7.294-7.293a1 1 0 0 1 1.41 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {s === "queued" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer brag */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">$0</span> in API
              spend &middot; ChatGPT Plus via Codex SDK
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
