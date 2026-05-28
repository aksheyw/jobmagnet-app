"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PortfolioRender } from "@/components/portfolio/PortfolioRender";
import { PitchEditor } from "@/components/editor/PitchEditor";
import { DeployModal } from "@/components/editor/DeployModal";
import type { Generation, CodexUsageRow } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wordmark } from "@/components/brand/BrandMark";
import {
  Search,
  Palette,
  PenLine,
  Lightbulb,
  Code2,
  Lock,
  Circle,
  type LucideIcon,
} from "lucide-react";

const AGENT_LABELS: Record<string, { label: string; icon: LucideIcon }> = {
  research: { label: "Research", icon: Search },
  brand: { label: "Brand", icon: Palette },
  narrative: { label: "Narrative", icon: PenLine },
  pitch: { label: "Pitch", icon: Lightbulb },
  code: { label: "Code", icon: Code2 },
};

function formatTokens(n: number) {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

function formatDurationSec(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function LoadingSkeleton() {
  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="h-4 rounded bg-slate-200 animate-pulse" />
      <div className="h-4 rounded bg-slate-200 animate-pulse w-3/4" />
      <div className="h-32 rounded bg-slate-200 animate-pulse" />
      <div className="h-4 rounded bg-slate-200 animate-pulse w-1/2" />
      <div className="h-4 rounded bg-slate-200 animate-pulse w-5/6" />
    </div>
  );
}

function BrowserChrome({
  candidateName,
  companyDomain,
  children,
}: {
  readonly candidateName: string;
  readonly companyDomain: string;
  readonly children: React.ReactNode;
}) {
  const slug = `${candidateName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${companyDomain.replace(/\./g, "-")}`;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400 shadow-inner" />
          <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-inner" />
          <span className="h-3 w-3 rounded-full bg-green-400 shadow-inner" />
        </div>
        <div className="hidden sm:flex items-center gap-1 ml-2 text-slate-400">
          <button
            type="button"
            aria-label="back"
            className="px-1 opacity-40 hover:opacity-60 cursor-default"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="forward"
            className="px-1 opacity-40 hover:opacity-60 cursor-default"
          >
            ›
          </button>
        </div>
        <div className="flex-1 mx-2">
          <div className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-600 font-mono flex items-center gap-2">
            <Lock className="h-3 w-3 flex-shrink-0 text-slate-400" aria-hidden />
            <span className="truncate">
              <span className="text-slate-400">https://</span>
              {slug}
              <span className="text-slate-400">.vercel.app</span>
            </span>
          </div>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1 text-[10px] text-amber-700 font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Preview
        </span>
      </div>
      {/* Content scroll */}
      <div
        className="overflow-y-auto bg-white"
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        {children}
      </div>
    </div>
  );
}

function TrailOfWork({ usage }: { readonly usage: CodexUsageRow[] }) {
  if (!usage || usage.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic">
        Usage data not available for this generation.
      </div>
    );
  }
  const totalIn = usage.reduce((a, r) => a + (r.tokens_input ?? 0), 0);
  const totalOut = usage.reduce((a, r) => a + (r.tokens_output ?? 0), 0);
  const totalCached = usage.reduce(
    (a, r) => a + (r.tokens_cached_input ?? 0),
    0,
  );
  const totalMs = usage.reduce((a, r) => a + (r.duration_ms ?? 0), 0);

  return (
    <div className="space-y-2">
      {/* Per-agent rows */}
      <ul className="space-y-1">
        {usage.map((row, i) => {
          const meta = AGENT_LABELS[row.agent] ?? {
            label: row.agent,
            icon: Circle,
          };
          const totalTokens =
            (row.tokens_input ?? 0) + (row.tokens_output ?? 0);
          return (
            <li
              key={`${row.agent}-${i}`}
              className="flex items-center gap-2 text-xs"
            >
              <span className="flex w-4 justify-center" aria-hidden>
                <meta.icon className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <span className="font-medium text-slate-700 w-16">
                {meta.label}
              </span>
              <span className="flex-1 text-right text-slate-500 font-mono tabular-nums">
                {formatTokens(totalTokens)}t
              </span>
              <span className="w-12 text-right text-slate-500 font-mono tabular-nums">
                {formatDurationSec(row.duration_ms)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="border-t border-slate-100 pt-2 space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Tokens in / out</span>
          <span className="font-mono tabular-nums text-slate-700">
            {formatTokens(totalIn)} / {formatTokens(totalOut)}
          </span>
        </div>
        {totalCached > 0 && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Cached read</span>
            <span className="font-mono tabular-nums text-emerald-700">
              {formatTokens(totalCached)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Total wall-clock</span>
          <span className="font-mono tabular-nums text-slate-700">
            {formatDurationSec(totalMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  const params = useParams<{ short_id: string }>();
  const shortId = params.short_id;

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pitchEditorOpen, setPitchEditorOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const fetchGeneration = useCallback(async () => {
    try {
      const res = await fetch(`/api/generations/${shortId}`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as {
        ok: boolean;
        generation?: Generation;
        error?: string;
      };
      if (!data.ok || !data.generation) {
        toast.error(data.error ?? "Failed to load your portfolio.");
        setLoading(false);
        return;
      }
      setGeneration(data.generation);
      setLoading(false);
    } catch {
      toast.error("Network error loading portfolio.");
      setLoading(false);
    }
  }, [shortId]);

  useEffect(() => {
    // Fire-and-forget initial fetch; fetchGeneration handles its own state updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGeneration();
  }, [fetchGeneration]);

  const usage = useMemo(() => generation?.codex_usage ?? [], [generation]);
  const agentsRanCount = usage.length;

  if (notFound) {
    return (
      <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-500">
            404
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Portfolio not found
          </h1>
          <p className="text-sm text-slate-500">
            We couldn&apos;t find a portfolio at this link.
          </p>
          <Link href="/start" className={cn(buttonVariants())}>
            Generate a new one &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const hasPitch = generation?.pitch_section != null;
  const pitchReviewed = generation?.pitch_reviewed ?? false;
  const needsPitchReview = hasPitch && !pitchReviewed;
  // F67: distinguish "user opted out at wizard" (pitch_stance == null)
  // from "user requested pitch but the agent failed" (pitch_stance != null,
  // pitch_section == null). Surface different copy + a retry hint for failures.
  const pitchRequested = (generation?.pitch_stance ?? null) != null;
  const pitchFailed = pitchRequested && !hasPitch;
  const canDownload = !needsPitchReview && (generation?.zip_url != null);

  return (
    <div className="min-h-dvh bg-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="JobMagnet home">
            <Wordmark size="sm" />
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500 font-mono">{shortId}</span>
        </div>
        <Link
          href="/start"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          &larr; New generation
        </Link>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-screen-2xl mx-auto w-full">
        {/* LEFT — Portfolio preview */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <LoadingSkeleton />
            </div>
          ) : generation ? (
            <div className="space-y-2">
              <p className="px-1 text-xs text-slate-500">
                Live preview of your generated site —{" "}
                <span className="font-medium text-slate-700">
                  download the project
                </span>{" "}
                to deploy it to your own URL.
              </p>
              <BrowserChrome
                candidateName={generation.narrative.candidate_name}
                companyDomain={generation.job_context.company_domain}
              >
                <PortfolioRender generation={generation} />
              </BrowserChrome>
            </div>
          ) : null}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="lg:w-80 xl:w-[22rem] flex-shrink-0 space-y-3">
          {/* Trail of work — real Codex usage */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Trail of work
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                {agentsRanCount}/5
              </span>
            </div>
            <TrailOfWork usage={usage} />
          </div>

          {/* Pitch status */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Pitch agent
            </p>
            {!hasPitch && !pitchFailed && (
              <Badge variant="secondary" className="text-xs">
                Not included in this generation
              </Badge>
            )}
            {pitchFailed && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-700 space-y-1.5">
                <p className="font-medium">
                  Pitch couldn&apos;t be generated this run
                </p>
                <p className="text-rose-600/90 leading-snug">
                  You asked for a {generation?.pitch_stance ?? ""} stance pitch
                  but the agent failed. Try a fresh generation with a sharper
                  seed observation.
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center text-[11px] font-medium text-rose-700 hover:text-rose-800 transition-colors"
                >
                  Retry with a new gen &rarr;
                </Link>
              </div>
            )}
            {hasPitch && needsPitchReview && (
              <button
                type="button"
                onClick={() => setPitchEditorOpen(true)}
                className="w-full flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <span>Needs your review &rarr;</span>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              </button>
            )}
            {hasPitch && pitchReviewed && (
              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                Pitch approved
              </Badge>
            )}
          </div>

          <Separator />

          {/* Regenerate — disabled in MVP */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" className="w-full" disabled />
              }
            >
              Regenerate entire portfolio
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming soon</p>
            </TooltipContent>
          </Tooltip>

          {/* Download & deploy */}
          {needsPitchReview ? (
            <Tooltip>
              <TooltipTrigger
                render={<Button className="w-full" disabled />}
              >
                Download & deploy
              </TooltipTrigger>
              <TooltipContent>
                <p>Review your pitch first</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              className="w-full"
              disabled={!canDownload}
              onClick={() => setDeployModalOpen(true)}
            >
              Download & deploy &rarr;
            </Button>
          )}

          {!generation?.zip_url && !loading && (
            <p className="text-xs text-slate-400 text-center">
              Portfolio zip is still being generated…
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {generation?.pitch_section && pitchEditorOpen && (
        <PitchEditor
          open={pitchEditorOpen}
          onClose={() => setPitchEditorOpen(false)}
          shortId={shortId}
          pitch={generation.pitch_section}
          onSuccess={fetchGeneration}
        />
      )}

      {generation && deployModalOpen && (
        <DeployModal
          open={deployModalOpen}
          onClose={() => setDeployModalOpen(false)}
          generation={generation}
        />
      )}
    </div>
  );
}
