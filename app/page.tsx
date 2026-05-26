import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600" />
          <span className="text-base font-semibold tracking-tight text-slate-900">
            JobMagnet
          </span>
        </div>
        <Link
          href="/start"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Try it free &rarr;
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 flex-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 mb-6">
          OpenAI × Outskill Hackathon
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mb-5 leading-tight">
          Tailored portfolios + cover letters in{" "}
          <span className="text-violet-600">60 seconds</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Paste a JD. Drop your LinkedIn. Walk away with a recruiter-ready site
          + 5-page PM-style pitch.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/start"
            className={cn(buttonVariants({ size: "lg" }), "text-base px-8")}
          >
            Try it free &rarr;
          </Link>
          <a
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "text-base px-8",
            )}
          >
            How it works
          </a>
        </div>
      </section>

      {/* Feature cards */}
      <section
        id="how-it-works"
        className="px-6 pb-20 max-w-5xl mx-auto w-full"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            icon="🎨"
            name="BrandSage"
            description="Pulls the company's real brand colors and fonts via Brandfetch, then styles your entire portfolio to match. Your site looks native to the company."
          />
          <FeatureCard
            icon="✍️"
            name="NarrativeSage"
            description="Reads the JD + your LinkedIn and writes a tailored headline, about section, cover letter, and role-specific resume bullets. Zero generic fluff."
          />
          <FeatureCard
            icon="💡"
            name="PitchSage"
            description="Optional 5-page PM pitch: problem, hypothesis, solution, metrics, tradeoffs. Pick your stance — builder, analyst, customer, or strategist."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>
          Built for the OpenAI × Outskill hackathon. $0 in API spend — every
          agent runs on ChatGPT Plus via the Codex SDK.
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  name,
  description,
}: {
  readonly icon: string;
  readonly name: string;
  readonly description: string;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <div className="text-2xl mb-1">{icon}</div>
        <CardTitle className="text-base font-semibold text-slate-900">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
