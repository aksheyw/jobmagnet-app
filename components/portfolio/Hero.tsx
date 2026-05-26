import type { BrandStyle, Narrative } from "@/lib/types";

interface HeroProps {
  readonly candidateName: string;
  readonly headline: string;
  readonly companyName: string;
  readonly brandStyle: BrandStyle;
}

export function Hero({ candidateName, headline, companyName, brandStyle }: HeroProps) {
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const mailtoHref = `mailto:?subject=${encodeURIComponent(`Let's connect — ${candidateName}`)}`;

  // Highlight company name in headline
  const parts = headline.split(companyName);

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
          href={mailtoHref}
          className="inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: brandStyle.primary }}
        >
          Schedule a call &rarr;
        </a>
        <a
          href={mailtoHref}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
