import type { CSSProperties } from "react";
import type { Theme } from "@/lib/brand-theme";

interface WorkEntry {
  readonly company: string;
  readonly title: string;
  readonly dates: string;
  readonly bullets: string[];
}

interface WorkProps {
  readonly theme: Theme;
  readonly entries: WorkEntry[];
}

export function Work({ theme, entries }: WorkProps) {
  // dividersVisible controls the rule between entries. "visible" → full-weight
  // theme.border; "light" → the same border token at reduced alpha (fainter,
  // still token-sourced — border is always a 6-digit mix() hex); "none" →
  // spacing only. The first entry never gets a top rule.
  const dividerColor =
    theme.flags.dividersVisible === "light"
      ? `${theme.border}66` // ~40% alpha on the 6-digit border hex
      : theme.border;
  const dividersOn = theme.flags.dividersVisible !== "none";

  const eyebrowStyle: CSSProperties = {
    color: theme.accent,
    fontSize: theme.eyebrow.fontSize,
    fontWeight: theme.eyebrow.fontWeight,
    letterSpacing: theme.eyebrow.letterSpacing,
    lineHeight: theme.eyebrow.lineHeight,
    textTransform: theme.eyebrow.textTransform,
  };

  const headingStyle: CSSProperties = {
    color: theme.fg,
    fontFamily: theme.headingFamily,
    fontSize: theme.h2.fontSize,
    fontWeight: theme.h2.fontWeight,
    letterSpacing: theme.h2.letterSpacing,
    lineHeight: theme.h2.lineHeight,
    textTransform: theme.h2.textTransform,
  };

  return (
    <section
      className="px-6"
      style={{
        backgroundColor: theme.surface,
        paddingTop: theme.sectionPy,
        paddingBottom: theme.sectionPy,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-2" style={eyebrowStyle}>
          Selected work
        </p>
        <h2 className="mb-8" style={headingStyle}>
          Where I&apos;ve worked
        </h2>
        <ol className="space-y-8">
          {entries.map((entry, entryIdx) => {
            const ruled = dividersOn && entryIdx > 0;
            const liStyle: CSSProperties = ruled
              ? {
                  borderTop: `1px solid ${dividerColor}`,
                  paddingTop: "2rem",
                }
              : {};
            return (
              <li
                key={`${entry.company}-${entry.dates}`}
                className="flex flex-col gap-1"
                style={liStyle}
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    className="text-base font-semibold"
                    style={{ color: theme.fg }}
                  >
                    {entry.company}
                  </span>
                  <span style={{ color: theme.meta }}>&middot;</span>
                  <span className="text-sm" style={{ color: theme.muted }}>
                    {entry.title}
                  </span>
                  <span
                    className="ml-auto text-xs"
                    style={{ color: theme.meta }}
                  >
                    {entry.dates}
                  </span>
                </div>
                <ul className="ml-4 mt-2 space-y-1">
                  {entry.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm leading-relaxed"
                      style={{ color: theme.muted }}
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: theme.primaryDecor }}
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
