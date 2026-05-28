"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Generation } from "@/lib/types";

interface DeployModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly generation: Generation;
}

function Step({
  number,
  title,
  children,
}: {
  readonly number: number;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm mb-1.5">{title}</p>
        <div className="text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

const GITHUB_COMMAND = `cd <your-unzipped-folder>
gh repo create my-portfolio --private --source=. --push`;

function CodeBlock({ code }: { readonly code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative mt-1">
      <pre className="rounded-md bg-slate-900 text-slate-100 text-xs px-4 py-3 whitespace-pre-wrap break-words">
        {code}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy command to clipboard"
        className="absolute top-2 right-2 rounded px-2 py-1 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeployModal({ open, onClose, generation }: DeployModalProps) {
  const sizeLabel = generation.zip_size_bytes
    ? formatBytes(generation.zip_size_bytes)
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy your portfolio</DialogTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Get it live on your own Vercel in about 2 minutes — you own the code
            and the URL.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Step number={1} title="Download your portfolio">
            {generation.zip_url ? (
              <a
                href={generation.zip_url}
                download
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700 transition-colors"
              >
                Download{sizeLabel ? ` (${sizeLabel})` : ""}
              </a>
            ) : (
              <span className="text-slate-400 italic text-xs">
                No download available yet.
              </span>
            )}
          </Step>

          <Separator />

          <Step number={2} title="Push to GitHub">
            <p className="mb-1">Run in your terminal:</p>
            <CodeBlock code={GITHUB_COMMAND} />
            <p className="mt-1.5 text-xs text-slate-400">
              Requires{" "}
              <a
                href="https://cli.github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                GitHub CLI
              </a>{" "}
              installed and authed.
            </p>
          </Step>

          <Separator />

          <Step number={3} title="Import to Vercel">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 underline text-sm"
            >
              Open vercel.com/new &rarr;
            </a>
            <p className="mt-1 text-xs text-slate-400">
              Import the GitHub repo you just created.
            </p>
          </Step>

          <Separator />

          <Step number={4} title="Click Deploy">
            <p>
              Vercel auto-detects Next.js. Click{" "}
              <strong className="text-slate-800">Deploy</strong>. Done in ~30s.
            </p>
          </Step>

          <Separator />

          <Step number={5} title="Share the URL">
            <p>
              Your portfolio will be at{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                your-project.vercel.app
              </code>
              . Send that to the recruiter.
            </p>
          </Step>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
