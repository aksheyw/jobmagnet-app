"use client";

import { useEffect, useState, useCallback } from "react";
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
import type { Generation } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AI_SUGGESTIONS = [
  {
    id: "1",
    text: "Highlight your biggest metric more prominently in the hero section",
  },
  {
    id: "2",
    text: "Consider tightening the cover letter intro to 2 sentences",
  },
  {
    id: "3",
    text: "Reorder Work section bullets to match JD priority keywords",
  },
];

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
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 font-mono truncate">
            {slug}.example.com
          </div>
        </div>
      </div>
      {/* Content scroll */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {children}
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
    fetchGeneration();
  }, [fetchGeneration]);

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
            This short ID doesn&apos;t exist or has expired.
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
  const canDownload = !needsPitchReview && (generation?.zip_url != null);

  return (
    <div className="min-h-dvh bg-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="size-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600" />
            <span className="text-sm font-semibold text-slate-800">
              JobMagnet
            </span>
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
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <LoadingSkeleton />
            </div>
          ) : generation ? (
            <BrowserChrome
              candidateName={generation.narrative.candidate_name}
              companyDomain={generation.job_context.company_domain}
            >
              <PortfolioRender generation={generation} />
            </BrowserChrome>
          ) : null}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-3">
          {/* Codex usage */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Codex usage
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">5</span>
              <span className="text-xs text-slate-400">agents ran</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ChatGPT Plus quota · $0 spend
            </p>
          </div>

          <Separator />

          {/* Pitch status */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PitchSage
            </p>
            {!hasPitch && (
              <Badge variant="secondary" className="text-xs">
                No pitch in this generation
              </Badge>
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

          {/* AI suggestions */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI suggestions
            </p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 rounded bg-slate-100 animate-pulse w-4/5" />
              </div>
            ) : (
              <ul className="space-y-2">
                {AI_SUGGESTIONS.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-2"
                  >
                    <span className="text-sm flex-shrink-0" aria-hidden>
                      ✦
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.text}
                    </p>
                  </li>
                ))}
              </ul>
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
              Regenerate
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming Day 4</p>
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
