import type { Theme } from "@/lib/brand-theme";

interface AboutProps {
  readonly theme: Theme;
  readonly text: string;
}

export function About({ theme, text }: AboutProps) {
  const showDivider = theme.flags.dividersVisible === "visible";

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
        <h2
          className="mb-6"
          style={{
            color: theme.fg,
            fontFamily: theme.headingFamily,
            fontSize: theme.h2.fontSize,
            fontWeight: theme.h2.fontWeight,
            letterSpacing: theme.h2.letterSpacing,
            lineHeight: theme.h2.lineHeight,
          }}
        >
          About
        </h2>

        {showDivider && (
          <div
            className="mb-6 h-0.5 w-12"
            style={{ backgroundColor: theme.primaryDecor }}
            aria-hidden="true"
          />
        )}

        <p
          className="max-w-[580px]"
          style={{
            color: theme.muted,
            fontSize: theme.body.fontSize,
            fontWeight: theme.body.fontWeight,
            letterSpacing: theme.body.letterSpacing,
            lineHeight: theme.body.lineHeight,
          }}
        >
          {text}
        </p>
      </div>
    </section>
  );
}
