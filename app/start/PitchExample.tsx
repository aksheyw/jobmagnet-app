"use client";

import { useState } from "react";
import { Eye, ArrowRight, Pencil } from "lucide-react";
import { deriveTheme } from "@/lib/brand-theme";
import { googleFontLinks } from "@/lib/font-map";
import { PitchSection } from "@/components/portfolio/PitchSection";
import {
  COMPANIES,
  COMPANY_KEYS,
  PITCHES,
  type CompanyKey,
  type Stance,
} from "./pitch-examples";

const PITCH_PARTS = ["Problem", "Hypothesis", "Solution", "Metric", "Tradeoff"];

/**
 * Onboarding aid for Section D. Always visible (even with the pitch toggle off)
 * so a first-timer understands what "Pitch agent" produces before enabling it:
 * a plain "you give → you get" strip + a collapsible example that renders the
 * REAL <PitchSection> for a chosen example company, keyed to the chosen stance.
 */
export function PitchExample({ stance }: { readonly stance: Stance }) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState<CompanyKey>("duolingo");

  const { name, brand } = COMPANIES[company];
  const theme = deriveTheme(brand);
  const pitch = PITCHES[company][stance](brand.primary);
  const fontLinks = googleFontLinks([brand.headline_font, brand.body_font]);

  return (
    <div className="space-y-3">
      {/* Brand fonts — rendered unconditionally (not gated behind the disclosure)
          so the preview never flashes a fallback font when it opens. React 19
          hoists these <link> tags into <head>. */}
      {fontLinks.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}

      {/* "You give → You get" — plain-language explainer */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
            <Pencil className="h-3 w-3" aria-hidden /> You give
          </p>
          <p className="text-[11.5px] leading-snug text-slate-700">
            A stance + <b>one</b> thing you noticed about their product.
          </p>
        </div>
        <div className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-indigo-600">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
            <Eye className="h-3 w-3" aria-hidden /> You get
          </p>
          <p className="mb-1.5 text-[11.5px] leading-snug text-slate-700">
            A rendered pitch section in your portfolio.
          </p>
          <div className="flex flex-wrap gap-1">
            {PITCH_PARTS.map((c) => (
              <span
                key={c}
                className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* "See an example" disclosure */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-indigo-700">
            <Eye className="h-4 w-4" aria-hidden /> See an example
          </span>
          <span className="text-sm text-slate-400" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <div className="border-t border-slate-100 bg-slate-50 p-3">
            {/* example company chips */}
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Example for
              </span>
              {COMPANY_KEYS.map((k) => {
                const sel = company === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCompany(k)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      sel
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: COMPANIES[k].brand.primary }}
                    />
                    {COMPANIES[k].name}
                  </button>
                );
              })}
            </div>
            <p className="mb-2 text-[11px] leading-snug text-slate-500">
              These are sample companies so you can see the output. Your pitch is
              about the job you pasted — picking one here only changes the preview.
            </p>

            {/* faux browser frame + the REAL PitchSection, height-bounded */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="ml-2 font-mono text-[10px] text-slate-400">
                  you.jobmagnet.app · {name.toLowerCase()}
                </span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <PitchSection theme={theme} pitch={pitch} companyName={name} />
              </div>
            </div>
            <p className="mt-2 text-[10.5px] text-slate-400">
              {pitch.evidence.length === 0
                ? `${name} · ${stance} renders text-only here — visuals appear when the agent has evidence to show.`
                : `${name} · ${stance} — scroll the preview; the visual is generated per pitch.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
