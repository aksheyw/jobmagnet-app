import type { Theme } from "@/lib/brand-theme";

interface HeroProps {
  readonly theme: Theme;
  readonly candidateName: string;
  readonly candidateContact?: string;
  readonly candidateEmail?: string;
  readonly headline: string;
  readonly companyName: string;
}

interface CtaTarget {
  kind: "linkedin" | "email" | "fallback";
  href: string;
  label: string;
  external: boolean;
}

function resolveCtas(
  contact: string | undefined,
  email: string | undefined,
  candidateName: string,
): readonly CtaTarget[] {
  const trimmedContact = contact?.trim() ?? "";
  const trimmedEmail = email?.trim() ?? "";
  const subject = encodeURIComponent(`Let's connect — ${candidateName}`);

  // 1. LinkedIn-from-contact (auto-prepend https:// for scheme-less input)
  let linkedinUrl: string | null = null;
  if (
    /linkedin\.com\/in\//i.test(trimmedContact) ||
    /^https?:\/\//i.test(trimmedContact)
  ) {
    linkedinUrl = /^https?:\/\//i.test(trimmedContact)
      ? trimmedContact
      : `https://${trimmedContact}`;
  }

  // 2. Email: prefer dedicated email prop, fall back to contact-if-email
  let emailAddr = "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    emailAddr = trimmedEmail;
  } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)) {
    // Only use contact-as-email if contact wasn't already used for LinkedIn
    if (!linkedinUrl) emailAddr = trimmedContact;
  }

  const ctas: CtaTarget[] = [];

  if (linkedinUrl) {
    ctas.push({
      kind: "linkedin",
      href: linkedinUrl,
      label: "Connect on LinkedIn →",
      external: true,
    });
  }

  if (emailAddr) {
    ctas.push({
      kind: "email",
      href: `mailto:${emailAddr}?subject=${subject}`,
      label: "Email me",
      external: false,
    });
  }

  if (ctas.length === 0) {
    ctas.push({
      kind: "fallback",
      href: `mailto:?subject=${subject}`,
      label: "Get in touch",
      external: false,
    });
  }

  return ctas;
}

export function Hero({
  theme,
  candidateName,
  candidateContact,
  candidateEmail,
  headline,
  companyName,
}: HeroProps) {
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const ctas = resolveCtas(candidateContact, candidateEmail, candidateName);
  // Guard: an empty companyName would make split("") return one item per
  // character (~50 spans). Only split when there's a real company to emphasize.
  const parts = companyName ? headline.split(companyName) : [headline];

  const splitLeft = theme.flags.heroLayout === "split-left";

  // Medallion shape per mood flag. circle-glow adds a soft accent halo.
  const medallionRadius =
    theme.flags.medallionShape === "square" ? "0.5rem" : "9999px";
  const medallionGlow =
    theme.flags.medallionShape === "circle-glow"
      ? `0 0 0 1px ${theme.accent}, 0 8px 32px -4px ${theme.accent}`
      : undefined;

  const medallion = (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center text-2xl font-bold"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondaryAccent})`,
        color: theme.onAccent,
        borderRadius: medallionRadius,
        boxShadow: medallionGlow,
        fontFamily: theme.headingFamily,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );

  const name = (
    <h1
      style={{
        color: theme.onHero,
        fontFamily: theme.headingFamily,
        fontSize: theme.h1.fontSize,
        fontWeight: theme.h1.fontWeight,
        letterSpacing: theme.h1.letterSpacing,
        lineHeight: theme.h1.lineHeight,
      }}
    >
      {candidateName}
    </h1>
  );

  const headlineEl = (
    <p
      className={splitLeft ? "max-w-xl" : "mx-auto max-w-xl"}
      style={{
        color: theme.onHeroMuted,
        fontFamily: theme.bodyFamily,
        fontSize: theme.body.fontSize,
        fontWeight: theme.body.fontWeight,
        letterSpacing: theme.body.letterSpacing,
        lineHeight: theme.body.lineHeight,
      }}
    >
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <strong style={{ color: theme.heroAccent, fontWeight: 700 }}>
              {companyName}
            </strong>
          )}
        </span>
      ))}
    </p>
  );

  const ctaRow = (
    <div
      className={
        splitLeft
          ? "flex flex-wrap items-center gap-3"
          : "flex flex-wrap items-center justify-center gap-3"
      }
    >
      {ctas.map((cta, idx) => {
        const isPrimary = idx === 0;
        const externalProps = cta.external
          ? { target: "_blank" as const, rel: "noopener noreferrer" }
          : {};
        return (
          <a
            key={cta.kind}
            href={cta.href}
            {...externalProps}
            className="inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            style={
              isPrimary
                ? { backgroundColor: theme.accent, color: theme.onAccent }
                : {
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.surface,
                    color: theme.fg,
                  }
            }
          >
            {cta.label}
          </a>
        );
      })}
    </div>
  );

  if (splitLeft) {
    return (
      <section
        className="px-6 text-left"
        style={{
          background: theme.heroBand,
          paddingTop: theme.sectionPy,
          paddingBottom: theme.sectionPy,
        }}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div className="md:shrink-0">{medallion}</div>
          <div className="flex flex-col gap-4">
            {name}
            {headlineEl}
            {ctaRow}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="px-6 text-center"
      style={{
        background: theme.heroBand,
        paddingTop: theme.sectionPy,
        paddingBottom: theme.sectionPy,
      }}
    >
      <div className="mx-auto mb-4 w-16">{medallion}</div>
      <div className="mb-2">{name}</div>
      {headlineEl}
      <div className="mt-6">{ctaRow}</div>
    </section>
  );
}
