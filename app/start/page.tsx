"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { Wordmark } from "@/components/brand/BrandMark";

type Stance = "builder" | "analyst" | "customer" | "strategist";

const STANCE_OPTIONS: Array<{
  value: Stance;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: "builder",
    label: "Builder",
    description: "What you'd ship — a concrete product feature or improvement.",
    icon: "🛠️",
  },
  {
    value: "analyst",
    label: "Analyst",
    description: "What you'd investigate — metrics, gaps, or strategic bets.",
    icon: "📊",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Where you'd lean in — pain points from a user's perspective.",
    icon: "🎯",
  },
  {
    value: "strategist",
    label: "Strategist",
    description: "What you'd propose — positioning, market, or org leverage.",
    icon: "🧭",
  },
];

const JD_EXAMPLES = [
  "https://stripe.com/jobs/listing/...",
  "https://jobs.lever.co/anthropic/...",
  "https://boards.greenhouse.io/openai/...",
  "https://www.linkedin.com/jobs/view/...",
];

export default function StartPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Section A
  const [profile, setProfile] = useState("");

  // Section B
  const [jdTab, setJdTab] = useState<"url" | "paste">("url");
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");

  // Section C
  const [email, setEmail] = useState("");

  // Section D
  const [pitchEnabled, setPitchEnabled] = useState(false);
  const [stance, setStance] = useState<Stance>("builder");
  const [seed, setSeed] = useState("");

  const jdProvided =
    jdTab === "url" ? jdUrl.trim().startsWith("http") : jdText.trim().length >= 40;
  const canSubmit = profile.trim().length >= 200 && jdProvided && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          parsed_profile: { raw_text: profile.trim() },
        };

        if (jdTab === "url") {
          body.jd_url = jdUrl.trim();
        } else {
          body.jd_paste_text = jdText.trim();
        }

        if (email.trim()) {
          body.email = email.trim();
        }

        if (pitchEnabled && seed.trim()) {
          body.pitch = {
            enabled: true,
            stance,
            seed: seed.trim(),
          };
        }

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = (await res.json()) as {
          ok: boolean;
          job_id?: string;
          short_id?: string;
          error?: string;
        };

        if (!data.ok || !data.job_id) {
          toast.error(data.error ?? "Generation failed. Please try again.");
          return;
        }

        router.push(
          `/jobs/${data.job_id}/progress?short_id=${data.short_id ?? ""}`,
        );
      } catch {
        toast.error("Network error — please check your connection and retry.");
      }
    });
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-10">
        <Link href="/" aria-label="JobMagnet home">
          <Wordmark size="sm" />
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Free during hackathon
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 lg:py-14">
        <div className="mb-9">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
            ~96 seconds · no account needed
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Generate your portfolio
          </h1>
          <p className="text-base text-slate-500">
            Four short sections. Skip the optional ones if you&apos;re in a
            hurry.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section A — Profile */}
          <Section
            label="A"
            icon="👤"
            title="Your profile"
            subtitle="Required · paste from LinkedIn export or About page"
          >
            <div className="space-y-2">
              <Label htmlFor="profile" className="sr-only">
                Paste your LinkedIn About + Experience
              </Label>
              <Textarea
                id="profile"
                rows={12}
                placeholder={`Paste your LinkedIn About + Experience sections.

Example:
Senior PM at Stripe. Previously led Growth at Dropbox (0 → 1M users). Built checkout flows processed by 3M+ merchants. Obsessed with reducing activation friction.

Work Experience
Stripe · Senior Product Manager · 2022 – Present
• Redesigned onboarding flow, reduced time-to-first-charge by 40%
• Led 6-person squad shipping Radar ML fraud rules
...`}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="font-mono text-sm resize-none bg-white"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 tabular-nums">
                  {profile.length} chars
                  {profile.length < 200 && profile.length > 0 && (
                    <span className="text-amber-600 ml-1.5">
                      ({200 - profile.length} more needed)
                    </span>
                  )}
                </span>
                {profile.length >= 200 && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Good to go
                  </span>
                )}
              </div>
            </div>
          </Section>

          {/* Section B — Job */}
          <Section
            label="B"
            icon="🎯"
            title="The job"
            subtitle="Required · paste the URL or the full JD text"
          >
            <Tabs
              value={jdTab}
              onValueChange={(v) => setJdTab(v as "url" | "paste")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="url">Job URL</TabsTrigger>
                <TabsTrigger value="paste">Paste JD text</TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <div className="space-y-3">
                  <Label htmlFor="jd-url" className="sr-only">
                    Job posting URL
                  </Label>
                  <Input
                    id="jd-url"
                    type="url"
                    placeholder="https://stripe.com/jobs/listing/..."
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    className="bg-white text-sm"
                  />
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">
                      Works with:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {JD_EXAMPLES.map((ex) => (
                        <li
                          key={ex}
                          className="text-[11px] text-slate-500 font-mono truncate"
                        >
                          <span className="text-slate-300">›</span> {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paste">
                <div className="space-y-2">
                  <Label htmlFor="jd-text" className="sr-only">
                    Paste job description
                  </Label>
                  <Textarea
                    id="jd-text"
                    rows={8}
                    placeholder="Copy and paste the full job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="font-mono text-sm resize-none bg-white"
                  />
                  <span className="text-xs text-slate-400 tabular-nums">
                    {jdText.length} chars
                    {jdText.length > 0 && jdText.length < 40 && (
                      <span className="text-amber-600 ml-1.5">
                        ({40 - jdText.length} more needed)
                      </span>
                    )}
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </Section>

          {/* Section C — Email */}
          <Section
            label="C"
            icon="✉️"
            title="Email"
            subtitle="Optional · skip if you don't need to come back later"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                Your email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-sm"
              />
              <p className="text-xs text-slate-400">
                We&apos;ll email you a magic link to come back and edit. Zero
                spam, no account created.
              </p>
            </div>
          </Section>

          {/* Section D — Pitch agent */}
          <Section
            label="D"
            icon="💡"
            title="Pitch agent"
            subtitle="Optional · adds a PM-style pitch (problem · hypothesis · solution · metrics · tradeoffs)"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Add a tailored pitch
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The big differentiator vs a generic resume site.
                  </p>
                </div>
                <Switch
                  checked={pitchEnabled}
                  onCheckedChange={setPitchEnabled}
                  aria-label="Enable Pitch agent"
                />
              </div>

              {pitchEnabled && (
                <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-4 space-y-5">
                  <div>
                    <Label className="text-sm font-medium text-slate-800 mb-3 block">
                      Choose your stance
                    </Label>
                    <RadioGroup
                      value={stance}
                      onValueChange={(v) => setStance(v as Stance)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {STANCE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          htmlFor={`stance-${opt.value}`}
                          className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-all ${
                            stance === opt.value
                              ? "border-indigo-500 bg-white shadow-sm ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <RadioGroupItem
                            id={`stance-${opt.value}`}
                            value={opt.value}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm" aria-hidden>
                                {opt.icon}
                              </span>
                              <p className="text-sm font-semibold text-slate-800">
                                {opt.label}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                              {opt.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="seed"
                      className="text-sm font-medium text-slate-800"
                    >
                      Your seed observation
                    </Label>
                    <Textarea
                      id="seed"
                      rows={3}
                      placeholder="What's one specific thing you noticed about this company's product? (1–3 sentences)"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="bg-white text-sm resize-none"
                    />
                    <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2">
                      <p className="text-[11px] text-slate-500 leading-snug">
                        <span className="font-semibold text-slate-600">
                          Example:
                        </span>{" "}
                        &ldquo;Stripe&apos;s mobile checkout has friction at
                        the card-number step — the keyboard layout forces three
                        taps to enter expiry.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Submit */}
        <div className="mt-10 space-y-3 sticky bottom-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-3">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              size="lg"
              className="w-full text-base"
            >
              {isPending ? "Submitting…" : "Generate my portfolio →"}
            </Button>
            {!canSubmit && !isPending && (
              <p className="text-xs text-slate-400 text-center mt-2">
                {profile.trim().length < 200 && "Section A needs 200+ chars. "}
                {!jdProvided && "Section B needs a JD."}
              </p>
            )}
            {canSubmit && (
              <p className="text-xs text-slate-500 text-center mt-2">
                Generation takes ~96 seconds. You&apos;ll see live progress on
                the next screen.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  icon,
  title,
  subtitle,
  children,
}: {
  readonly label: string;
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <span
          className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-base font-bold text-indigo-700 ring-1 ring-indigo-100"
          aria-hidden
        >
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none" aria-hidden>
              {icon}
            </span>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
