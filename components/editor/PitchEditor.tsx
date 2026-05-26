"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PitchSection } from "@/lib/types";

interface PitchEditorProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly shortId: string;
  readonly pitch: PitchSection;
  readonly onSuccess: () => void;
}

type EditState = Partial<{
  problem: string;
  hypothesis: string;
  proposed_solution: string;
  metrics_to_track: string[];
  tradeoffs: string[];
  guardrails: string[];
}>;

function ChipList({
  label,
  items,
  editable,
  onChange,
}: {
  readonly label: string;
  readonly items: string[];
  readonly editable: boolean;
  readonly onChange: (items: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState("");

  function addChip() {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setInputVal("");
  }

  function removeChip(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {items.map((item, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="text-xs py-0.5 gap-1"
          >
            {item}
            {editable && (
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => removeChip(i)}
                className="ml-0.5 opacity-60 hover:opacity-100 text-xs"
              >
                ×
              </button>
            )}
          </Badge>
        ))}
      </div>
      {editable && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Add ${label.toLowerCase()}…`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChip())}
            className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Button type="button" variant="outline" size="sm" onClick={addChip}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

export function PitchEditor({
  open,
  onClose,
  shortId,
  pitch,
  onSuccess,
}: PitchEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [edits, setEdits] = useState<EditState>({
    problem: pitch.problem,
    hypothesis: pitch.hypothesis,
    proposed_solution: pitch.proposed_solution,
    metrics_to_track: [...pitch.metrics_to_track],
    tradeoffs: [...pitch.tradeoffs],
    guardrails: [...pitch.guardrails],
  });

  function update<K extends keyof EditState>(key: K, value: EditState[K]) {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }

  function handleAction(action: "approve" | "skip") {
    startTransition(async () => {
      try {
        const body =
          action === "approve"
            ? { action: "approve", edits: isEditing ? edits : undefined }
            : { action: "skip" };

        const res = await fetch(`/api/generations/${shortId}/pitch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = (await res.json()) as { ok: boolean; error?: string };

        if (!data.ok) {
          toast.error(data.error ?? "Failed to save pitch decision.");
          return;
        }

        toast.success(
          action === "approve"
            ? "Pitch approved and included in your portfolio."
            : "Pitch removed from portfolio.",
        );
        onSuccess();
        onClose();
      } catch {
        toast.error("Network error — please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{pitch.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize text-xs">
              {pitch.stance} stance
            </Badge>
            <span className="text-xs text-slate-400">
              Confidence: {Math.round(pitch.confidence * 100)}%
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Edit toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Review the AI-generated pitch. Edit any section before approving.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? "Done editing" : "Edit"}
            </Button>
          </div>

          {/* Problem */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              The problem
            </Label>
            {isEditing ? (
              <Textarea
                rows={4}
                value={edits.problem}
                onChange={(e) => update("problem", e.target.value)}
                className="text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {edits.problem}
              </p>
            )}
          </div>

          {/* Hypothesis */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Hypothesis
            </Label>
            {isEditing ? (
              <Textarea
                rows={3}
                value={edits.hypothesis ?? ""}
                onChange={(e) => update("hypothesis", e.target.value)}
                className="text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {edits.hypothesis || (
                  <span className="text-slate-400 italic">None</span>
                )}
              </p>
            )}
          </div>

          {/* Proposed solution */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Proposed solution
            </Label>
            {isEditing ? (
              <Textarea
                rows={4}
                value={edits.proposed_solution}
                onChange={(e) => update("proposed_solution", e.target.value)}
                className="text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {edits.proposed_solution}
              </p>
            )}
          </div>

          {/* Metrics */}
          <ChipList
            label="Metrics to track"
            items={edits.metrics_to_track ?? []}
            editable={isEditing}
            onChange={(v) => update("metrics_to_track", v)}
          />

          {/* Tradeoffs */}
          <ChipList
            label="Tradeoffs"
            items={edits.tradeoffs ?? []}
            editable={isEditing}
            onChange={(v) => update("tradeoffs", v)}
          />

          {/* Guardrails */}
          <ChipList
            label="Guardrails"
            items={edits.guardrails ?? []}
            editable={isEditing}
            onChange={(v) => update("guardrails", v)}
          />

          {/* Evidence (read-only always) */}
          {pitch.evidence.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Evidence
              </Label>
              <ul className="space-y-1.5">
                {pitch.evidence.map((ev) => (
                  <li key={ev.url} className="text-sm">
                    <span className="text-slate-400 text-xs uppercase mr-2">
                      {ev.type}
                    </span>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      {ev.caption}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction("skip")}
            disabled={isPending}
          >
            Skip — remove pitch from portfolio
          </Button>
          <Button
            onClick={() => handleAction("approve")}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Approve pitch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
