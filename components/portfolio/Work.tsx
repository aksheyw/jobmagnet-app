interface WorkEntry {
  readonly company: string;
  readonly title: string;
  readonly dates: string;
  readonly bullets: string[];
}

interface WorkProps {
  readonly entries: WorkEntry[];
  readonly brandPrimary: string;
}

export function Work({ entries, brandPrimary }: WorkProps) {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: brandPrimary }}
        >
          Selected work
        </p>
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900">
          Where I&apos;ve worked
        </h2>
        <ol className="space-y-8">
          {entries.map((entry) => (
            <li
              key={`${entry.company}-${entry.dates}`}
              className="flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-base font-semibold text-slate-900">
                  {entry.company}
                </span>
                <span className="text-slate-400">&middot;</span>
                <span className="text-sm text-slate-700">{entry.title}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {entry.dates}
                </span>
              </div>
              <ul className="ml-4 mt-2 space-y-1">
                {entry.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: brandPrimary }}
                      aria-hidden="true"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
