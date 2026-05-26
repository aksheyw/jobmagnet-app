interface AboutProps {
  readonly text: string;
}

export function About({ text }: AboutProps) {
  return (
    <section className="bg-slate-50 px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
          About
        </h2>
        <p className="max-w-[580px] text-base leading-relaxed text-slate-600">
          {text}
        </p>
      </div>
    </section>
  );
}
