import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-3xl space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <span className="text-lg font-semibold tracking-tight">JobMagnet</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            day 1 • foundation
          </Badge>
        </header>

        <section className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            One job application. Five Codex agents. A portfolio site you own.
          </h1>
          <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400">
            Drop a LinkedIn PDF and a job description. We generate a branded portfolio, a tailored resume, a cover
            letter, and an optional product critique — all delivered as a Next.js project you deploy to your own Vercel.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button disabled>Start your application →</Button>
            <Button variant="outline" disabled>
              How it works
            </Button>
          </div>
          <p className="text-xs text-zinc-500">Wizard ships Day 2 (MVP submission). This page is the foundation milestone.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System status</CardTitle>
            <CardDescription>Day-1 surface — what is live right now</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <StatusRow label="VPS Codex runtime" status="live" detail="jobmagnet-codex.aksheywalia.in/health" />
            <StatusRow label="ResearchSage v0" status="live" detail="POST /run-agent { agent: 'research' }" />
            <StatusRow label="Supabase schema" status="live" detail="5 tables + RLS + perf advisors green" />
            <StatusRow label="Cloudflare Tunnel" status="live" detail="HTTPS via existing sage-control tunnel" />
            <StatusRow label="Wizard + agents UI" status="pending" detail="Day 2 (Wed)" />
            <StatusRow label="Download & deploy" status="pending" detail="Day 2 (Wed)" />
          </CardContent>
        </Card>

        <footer className="pt-6 text-xs text-zinc-500">
          Built for the OpenAI × Outskill hackathon · May 26–31, 2026.
        </footer>
      </div>
    </main>
  );
}

function StatusRow({ label, status, detail }: { label: string; status: "live" | "pending"; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={
          status === "live"
            ? "mt-1.5 size-2 rounded-full bg-emerald-500"
            : "mt-1.5 size-2 rounded-full bg-zinc-300 dark:bg-zinc-700"
        }
      />
      <div>
        <div className="font-medium">{label}</div>
        <div className="font-mono text-xs text-zinc-500">{detail}</div>
      </div>
    </div>
  );
}
