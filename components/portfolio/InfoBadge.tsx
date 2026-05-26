"use client";

import { useState } from "react";

export function InfoBadge() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="About this site"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="fixed bottom-4 right-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-xs font-semibold text-slate-500 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        style={{ fontSize: "11px" }}
      >
        i
      </button>

      {visible && (
        <div
          role="tooltip"
          className="fixed bottom-12 right-4 z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-md"
          style={{ fontSize: "12px" }}
        >
          <p className="font-semibold text-slate-900">About this site</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            Built with JobMagnet — AI-tailored portfolio for this role. All
            content written by the candidate; AI helped tailor the framing.
          </p>
          <a
            href="https://jobmagnet-app.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-indigo-600 underline"
          >
            Make your own &rarr;
          </a>
        </div>
      )}
    </>
  );
}
