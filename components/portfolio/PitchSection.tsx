import type { PitchSection as PitchSectionType } from "@/lib/types";

interface PitchSectionProps {
  readonly pitch: PitchSectionType;
  readonly companyName: string;
  readonly brandPrimary: string;
  readonly brandInk: string;
}

const STANCE_TITLES: Record<
  PitchSectionType["stance"],
  (company: string) => string
> = {
  builder: (c) => `What I'd ship at ${c}`,
  analyst: (c) => `What I'd investigate at ${c}`,
  customer: (c) => `The friction I hit using ${c}`,
  strategist: (c) => `Where ${c} should go next`,
};

export function PitchSection({
  pitch,
  companyName,
  brandPrimary,
  brandInk,
}: PitchSectionProps) {
  const sectionTitle = STANCE_TITLES[pitch.stance](companyName);

  return (
    <section
      className="px-6 py-14"
      style={{
        background: `linear-gradient(180deg, color-mix(in srgb, ${brandPrimary} 4%, white) 0%, color-mix(in srgb, ${brandPrimary} 10%, white) 100%)`,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: brandInk }}
        >
          A pitch &middot; {pitch.stance} stance
        </p>
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900">
          {sectionTitle}
        </h2>

        {/* Problem */}
        <div
          className="mb-6 rounded-lg border p-5"
          style={{
            borderColor: `color-mix(in srgb, ${brandPrimary} 30%, white)`,
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            The problem
          </p>
          <p className="text-sm leading-relaxed text-slate-800">
            {pitch.problem}
          </p>
        </div>

        {/* Hypothesis */}
        {pitch.hypothesis && (
          <div className="mb-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Hypothesis
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {pitch.hypothesis}
            </p>
          </div>
        )}

        {/* Proposed solution */}
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Proposed solution
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {pitch.proposed_solution}
          </p>
        </div>

        {/* Metrics chips */}
        {pitch.metrics_to_track.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Metrics to track
            </p>
            <div className="flex flex-wrap gap-2">
              {pitch.metrics_to_track.map((m) => (
                <span
                  key={m}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${brandPrimary} 10%, white)`,
                    color: brandInk,
                    border: `1px solid color-mix(in srgb, ${brandPrimary} 25%, white)`,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tradeoffs + Guardrails */}
        {(pitch.tradeoffs.length > 0 || pitch.guardrails.length > 0) && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            {pitch.tradeoffs.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Tradeoffs
                </p>
                <ul className="space-y-1.5">
                  {pitch.tradeoffs.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1 text-amber-500" aria-hidden>
                        &#9651;
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pitch.guardrails.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Guardrails
                </p>
                <ul className="space-y-1.5">
                  {pitch.guardrails.map((g) => (
                    <li
                      key={g}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1 text-emerald-500" aria-hidden>
                        &#9679;
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Evidence grid */}
        {pitch.evidence.length > 0 && (
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Evidence
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pitch.evidence.map((ev) => (
                <div
                  key={ev.url}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <div className="relative aspect-video w-full bg-slate-50">
                    <img
                      src={ev.url}
                      alt={ev.caption}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="px-4 py-2 text-xs text-slate-500">
                    {ev.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
