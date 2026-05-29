import type { BrandStyle } from "@/lib/types";
import type { BrandRoles } from "@/lib/brand-contrast";

interface HeroProps {
  readonly candidateName: string;
  readonly candidateContact?: string;
  readonly candidateEmail?: string;
  readonly headline: string;
  readonly companyName: string;
  readonly brandStyle: BrandStyle;
  readonly brand: BrandRoles;
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
  candidateName,
  candidateContact,
  candidateEmail,
  headline,
  companyName,
  brandStyle,
  brand,
}: HeroProps) {
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const ctas = resolveCtas(candidateContact, candidateEmail, candidateName);
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
          // ink (not raw primary): keeps the white initials legible even when
          // the brand primary is pale (e.g. Sarvam #C1CCF5).
          background: `linear-gradient(135deg, ${brand.ink}, ${brandStyle.secondary})`,
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
              <strong style={{ color: brand.ink }}>{companyName}</strong>
            )}
          </span>
        ))}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
              className={
                isPrimary
                  ? "inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  : "inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              }
              style={
                isPrimary ? { backgroundColor: brand.ink } : undefined
              }
            >
              {cta.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
