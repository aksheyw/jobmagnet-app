import type { PitchSection as PitchSectionType } from "@/lib/types";
import type { Theme } from "@/lib/brand-theme";

interface PitchSectionProps {
  readonly theme: Theme;
  readonly pitch: PitchSectionType;
  readonly companyName: string;
}

// Evidence/media well stays near-white in every mood so SVGs/screenshots
// remain legible even in dark-mood themes (R3).
const MEDIA_WELL = "#F4F4F5";

const STANCE_TITLES: Record<
  PitchSectionType["stance"],
  (company: string) => string
> = {
  builder: (c) => `What I'd ship at ${c}`,
  analyst: (c) => `What I'd investigate at ${c}`,
  customer: (c) => `The friction I hit using ${c}`,
  strategist: (c) => `Where ${c} should go next`,
};

export function PitchSection({ theme, pitch, companyName }: PitchSectionProps) {
  const sectionTitle = STANCE_TITLES[pitch.stance](companyName);
  const cardBordered = theme.flags.cardStyle !== "borderless";

  const subLabelStyle = {
    color: theme.meta,
    fontSize: theme.eyebrow.fontSize,
    fontWeight: theme.eyebrow.fontWeight,
    letterSpacing: theme.eyebrow.letterSpacing,
    lineHeight: theme.eyebrow.lineHeight,
    textTransform: theme.eyebrow.textTransform,
  } as const;

  return (
    <section
      className="px-6"
      style={{
        backgroundColor: theme.surfaceAlt,
        paddingTop: theme.sectionPy,
        paddingBottom: theme.sectionPy,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="mb-2"
          style={{
            color: theme.accent,
            fontSize: theme.eyebrow.fontSize,
            fontWeight: theme.eyebrow.fontWeight,
            letterSpacing: theme.eyebrow.letterSpacing,
            lineHeight: theme.eyebrow.lineHeight,
            textTransform: theme.eyebrow.textTransform,
          }}
        >
          A pitch &middot; {pitch.stance} stance
        </p>
        <h2
          className="mb-8"
          style={{
            color: theme.fg,
            fontFamily: theme.headingFamily,
            fontSize: theme.h2.fontSize,
            fontWeight: theme.h2.fontWeight,
            letterSpacing: theme.h2.letterSpacing,
            lineHeight: theme.h2.lineHeight,
          }}
        >
          {sectionTitle}
        </h2>

        {/* Problem */}
        <div
          className="mb-6 rounded-lg p-5"
          style={{
            backgroundColor: theme.cardBg,
            ...(cardBordered ? { border: `1px solid ${theme.border}` } : {}),
          }}
        >
          <p className="mb-1" style={subLabelStyle}>
            The problem
          </p>
          <p className="text-sm leading-relaxed" style={{ color: theme.fg }}>
            {pitch.problem}
          </p>
        </div>

        {/* Hypothesis */}
        {pitch.hypothesis && (
          <div className="mb-6">
            <p className="mb-1" style={subLabelStyle}>
              Hypothesis
            </p>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
              {pitch.hypothesis}
            </p>
          </div>
        )}

        {/* Proposed solution */}
        <div className="mb-8">
          <p className="mb-1" style={subLabelStyle}>
            Proposed solution
          </p>
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            {pitch.proposed_solution}
          </p>
        </div>

        {/* Metrics chips */}
        {pitch.metrics_to_track.length > 0 && (
          <div className="mb-8">
            <p className="mb-3" style={subLabelStyle}>
              Metrics to track
            </p>
            <div className="flex flex-wrap gap-2">
              {pitch.metrics_to_track.map((m) => (
                <span
                  key={m}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.accent,
                    border: `1px solid ${theme.border}`,
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
                <p className="mb-3" style={subLabelStyle}>
                  Tradeoffs
                </p>
                <ul className="space-y-1.5">
                  {pitch.tradeoffs.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: theme.muted }}
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
                <p className="mb-3" style={subLabelStyle}>
                  Guardrails
                </p>
                <ul className="space-y-1.5">
                  {pitch.guardrails.map((g) => (
                    <li
                      key={g}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: theme.muted }}
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
            <p className="mb-4" style={subLabelStyle}>
              Evidence
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pitch.evidence.map((ev) => (
                <div
                  key={ev.url}
                  className="overflow-hidden rounded-lg"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div
                    className="relative aspect-video w-full"
                    // The well is always near-white; pin dark text so a failed
                    // image's alt text stays legible even in dark mood (not the
                    // inherited near-white theme.fg).
                    style={{ backgroundColor: MEDIA_WELL, color: "#334155" }}
                  >
                    <img
                      src={ev.url}
                      alt={ev.caption}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="px-4 py-2 text-xs" style={{ color: theme.meta }}>
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
