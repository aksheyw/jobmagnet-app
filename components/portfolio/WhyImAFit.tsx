import type { CSSProperties } from "react";
import type { Theme } from "@/lib/brand-theme";

interface WhyFitItem {
  readonly bullet: string;
  readonly metric: string;
}

interface WhyImAFitProps {
  readonly theme: Theme;
  readonly items: WhyFitItem[];
}

/**
 * Build the per-card container style from the mood's cardStyle flag. Every mood
 * keeps the 2px brand left rule (primaryDecor); the flag layers on a border,
 * a card surface, and/or a shadow so moods read genuinely differently.
 */
function cardStyleFor(theme: Theme): CSSProperties {
  const leftRule = `2px solid ${theme.primaryDecor}`;
  switch (theme.flags.cardStyle) {
    case "bordered":
      return {
        borderLeft: leftRule,
        border: `1px solid ${theme.border}`,
        borderLeftWidth: "2px",
        borderLeftColor: theme.primaryDecor,
        borderRadius: "0.5rem",
        padding: "1.25rem",
      };
    case "elevated-dark":
      return {
        borderLeft: leftRule,
        backgroundColor: theme.cardBg,
        borderRadius: "0.5rem",
        padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.35)",
      };
    case "shadow-rounded":
      return {
        borderLeft: leftRule,
        backgroundColor: theme.cardBg,
        borderRadius: "0.75rem",
        padding: "1.25rem",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 12px 28px rgba(15,23,42,0.10)",
      };
    default: // borderless — just the left rule (today's look)
      return {
        borderLeft: leftRule,
        paddingLeft: "1rem",
      };
  }
}

export function WhyImAFit({ theme, items }: WhyImAFitProps) {
  const cardStyle = cardStyleFor(theme);

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
        <p
          className="mb-2"
          style={{
            color: theme.accent,
            fontFamily: theme.bodyFamily,
            fontSize: theme.eyebrow.fontSize,
            fontWeight: theme.eyebrow.fontWeight,
            letterSpacing: theme.eyebrow.letterSpacing,
            lineHeight: theme.eyebrow.lineHeight,
            textTransform: theme.eyebrow.textTransform,
          }}
        >
          Why I&apos;m a fit
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
            textTransform: theme.h2.textTransform,
          }}
        >
          Built for this role, not just any role.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.metric} style={cardStyle}>
              <p
                className="mb-1"
                style={{
                  color: theme.fg,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {item.metric}
              </p>
              <p
                style={{
                  color: theme.muted,
                  fontSize: "0.875rem",
                  lineHeight: theme.body.lineHeight,
                }}
              >
                {item.bullet}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
