import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/BrandMark";
import { LandingDemo } from "@/components/brand/LandingDemo";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <Link href="/" aria-label="JobMagnet home">
          <Wordmark size="md" />
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#how-it-works"
            className="hidden sm:inline text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            How it works
          </a>
          <Link
            href="/start"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Try it free &rarr;
          </Link>
        </div>
      </nav>

      {/* Hero — split layout */}
      <section className="px-6 pt-12 pb-16 lg:pt-20 lg:pb-24 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              OpenAI × Outskill Hackathon · Live
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.05]">
              The portfolio recruiters{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-indigo-600">
                  can&apos;t ignore
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-3 w-full bg-amber-200/60 -z-0 rounded-sm"
                  aria-hidden
                />
              </span>
              .
            </h1>
            <p className="text-base md:text-lg text-slate-500 mb-7 leading-relaxed max-w-lg">
              Paste a job description. Drop your LinkedIn. In 96 seconds, walk
              away with a brand-matched portfolio site + a PM-style pitch
              tailored to that exact role.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/start"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "text-base px-7",
                )}
              >
                Try it free &rarr;
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-base px-7",
                )}
              >
                See the 5 agents
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                $0 token spend
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                No account needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Self-deploy to Vercel
              </span>
            </div>
          </div>

          {/* Right — live demo */}
          <div className="lg:pl-4">
            <LandingDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-6 pb-20 max-w-6xl mx-auto w-full"
      >
        <div className="mb-10">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
            5 agents · 1 portfolio
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight max-w-2xl">
            Each agent does one job. Together they ship a portfolio in 96
            seconds.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AgentCard
            order={1}
            icon="🔍"
            name="Research"
            description="Scrapes the JD, parses career level, infers the right pitch stance."
          />
          <AgentCard
            order={2}
            icon="🎨"
            name="Brand"
            description="Pulls real brand colors + fonts via Brandfetch. Your site looks native to the company."
          />
          <AgentCard
            order={3}
            icon="✍️"
            name="Narrative"
            description="Writes your headline, About, cover letter, and role-specific resume bullets. Zero generic fluff."
          />
          <AgentCard
            order={4}
            icon="💡"
            name="Pitch"
            description="Optional PM-style pitch — problem, hypothesis, solution, metrics. Builder · Analyst · Customer · Strategist."
          />
          <AgentCard
            order={5}
            icon="⚙️"
            name="Code"
            description="Generates a buildable Next.js project + zips it for self-deploy. Deterministic, zero tokens."
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 pb-16 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <Stat
              value="96s"
              label="median end-to-end"
              note="from paste to download"
            />
            <Stat
              value="$0"
              label="API spend"
              note="ChatGPT Plus OAuth via Codex SDK"
            />
            <Stat
              value="5"
              label="specialized agents"
              note="orchestrated in parallel where possible"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400 mt-auto">
        <p className="mb-1">
          Built solo for the OpenAI × Outskill hackathon · May 25 – 31, 2026
        </p>
        <p>
          Every agent runs on{" "}
          <a
            href="https://platform.openai.com/codex"
            className="underline hover:text-slate-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenAI Codex SDK
          </a>{" "}
          via ChatGPT Plus OAuth. Zero token spend.
        </p>
      </footer>
    </main>
  );
}

function AgentCard({
  order,
  icon,
  name,
  description,
}: {
  readonly order: number;
  readonly icon: string;
  readonly name: string;
  readonly description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <span className="text-[10px] font-mono text-slate-300 group-hover:text-indigo-400 transition-colors">
          0{order}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        {name}{" "}
        <span className="font-normal text-slate-400 text-xs">agent</span>
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Stat({
  value,
  label,
  note,
}: {
  readonly value: string;
  readonly label: string;
  readonly note: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-xs text-slate-400">{note}</p>
    </div>
  );
}
