import type { Metadata } from "next";
import { GALLERY_CARDS } from "@/lib/examples";
import { PortfolioRender } from "@/components/portfolio/PortfolioRender";

export const metadata: Metadata = {
  title: "Brand gallery — JobMagnet",
  description:
    "One candidate, eight companies. JobMagnet tailors each portfolio to the role and renders it in that employer's real brand — colors, type, and mood, automatically.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-dvh bg-slate-100">
      <header className="mx-auto max-w-3xl px-6 py-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Brand gallery
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          One candidate. Eight company brands.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          Every portfolio below uses the same real career history — only the
          target company changes. JobMagnet tailors the framing to the role and
          matches each employer&apos;s colors, type, and mood automatically.
          Duolingo is a real generation; the rest are illustrative.
        </p>
      </header>

      <div className="space-y-10 pb-20">
        {GALLERY_CARDS.map(({ generation, moodLabel }) => (
          <section key={generation.short_id} className="mx-auto max-w-5xl px-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-700">
                {generation.job_context.company_name}
                <span className="ml-2 font-normal text-slate-500">
                  {generation.job_context.company_domain}
                </span>
              </h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {moodLabel}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 shadow-sm">
              <PortfolioRender
                generation={generation}
                showInfoBadge={false}
                headingLevel={2}
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
