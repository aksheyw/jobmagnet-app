import type { BrandStyle } from "@/lib/types";

interface HeroProps {
  readonly candidateName: string;
  readonly candidateContact?: string;
  readonly headline: string;
  readonly companyName: string;
  readonly brandStyle: BrandStyle;
}

function resolveContactHref(contact: string | undefined, candidateName: string): {
  primaryHref: string;
  secondaryHref: string;
  primaryLabel: string;
  secondaryLabel: string;
} {
  const trimmed = contact?.trim() ?? "";
  const subject = encodeURIComponent(`Let's connect — ${candidateName}`);

  if (!trimmed) {
    const fallback = `mailto:?subject=${subject}`;
    return {
      primaryHref: fallback,
      secondaryHref: fallback,
      primaryLabel: "Schedule a call →",
      secondaryLabel: "Get in touch",
    };
  }

  if (/linkedin\.com\/in\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return {
      primaryHref: href,
      secondaryHref: href,
      primaryLabel: "Connect on LinkedIn →",
      secondaryLabel: "View profile",
    };
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    const mailto = `mailto:${trimmed}?subject=${subject}`;
    return {
      primaryHref: mailto,
      secondaryHref: mailto,
      primaryLabel: "Schedule a call →",
      secondaryLabel: "Get in touch",
    };
  }

  const fallback = `mailto:?subject=${subject}`;
  return {
    primaryHref: fallback,
    secondaryHref: fallback,
    primaryLabel: "Schedule a call →",
    secondaryLabel: "Get in touch",
  };
}

export function Hero({
  candidateName,
  candidateContact,
  headline,
  companyName,
  brandStyle,
}: HeroProps) {
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const { primaryHref, secondaryHref, primaryLabel, secondaryLabel } =
    resolveContactHref(candidateContact, candidateName);

  const parts = headline.split(companyName);

  const externalLink = /^https?:\/\//i.test(primaryHref);
  const linkRelAttrs = externalLink
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <section
      className="py-16 px-6 text-center"
      style={{
        background: `linear-gradient(180deg, ${brandStyle.background} 0%, color-mix(in srgb, ${brandStyle.primary} 4%, white) 100%)`,
      }}
    >
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${brandStyle.primary}, ${brandStyle.secondary})`,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <h1
        className="mb-2 text-4xl font-bold tracking-tight text-slate-900"
        style={{ letterSpacing: "-0.5px" }}
      >
        {candidateName}
      </h1>

      <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <strong style={{ color: brandStyle.primary }}>{companyName}</strong>
            )}
          </span>
        ))}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={primaryHref}
          {...linkRelAttrs}
          className="inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: brandStyle.primary }}
        >
          {primaryLabel}
        </a>
        <a
          href={secondaryHref}
          {...linkRelAttrs}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
        >
          {secondaryLabel}
        </a>
      </div>
    </section>
  );
}
