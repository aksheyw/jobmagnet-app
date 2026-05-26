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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Stance = "builder" | "analyst" | "customer" | "strategist";

const STANCE_OPTIONS: Array<{
  value: Stance;
  label: string;
  description: string;
}> = [
  {
    value: "builder",
    label: "Builder",
    description: "What you'd ship — a concrete product feature or improvement.",
  },
  {
    value: "analyst",
    label: "Analyst",
    description: "What you'd investigate — metrics, gaps, or strategic bets.",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Where you'd lean in — pain points from a user's perspective.",
  },
  {
    value: "strategist",
    label: "Strategist",
    description: "What you'd propose — positioning, market, or org leverage.",
  },
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
          body.pitchsage = {
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
    <div className="min-h-dvh bg-slate-50">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600" />
          <span className="text-sm font-semibold text-slate-800">JobMagnet</span>
        </Link>
        <span className="text-xs text-slate-400">Free during hackathon</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Generate your portfolio
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Takes ~60 seconds. No account needed.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section A — Profile */}
          <Section label="A" title="Your profile">
            <div className="space-y-2">
              <Label htmlFor="profile" className="text-sm font-medium text-slate-700">
                Paste your LinkedIn About + Experience
              </Label>
              <Textarea
                id="profile"
                rows={12}
                placeholder={`Paste the text from your LinkedIn profile — your About section, recent roles, and key accomplishments.

Example:
Senior PM at Stripe. Previously led Growth at Dropbox (0→1M users). Built checkout flows processed by 3M+ merchants. Obsessed with reducing activation friction.

Work Experience:
Stripe · Senior Product Manager · 2022–Present
• Redesigned onboarding flow, reducing time-to-first-charge by 40%
• Led 6-person squad shipping Radar ML fraud rules...`}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="font-mono text-sm resize-none bg-white"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {profile.length} chars
                  {profile.length < 200 && profile.length > 0 && (
                    <span className="text-amber-500 ml-1">
                      (need {200 - profile.length} more)
                    </span>
                  )}
                </span>
                {profile.length >= 200 && (
                  <span className="text-xs text-emerald-600 font-medium">Good to go</span>
                )}
              </div>
            </div>
          </Section>

          <Separator />

          {/* Section B — Job */}
          <Section label="B" title="The job">
            <Tabs
              value={jdTab}
              onValueChange={(v) => setJdTab(v as "url" | "paste")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="url">Job URL</TabsTrigger>
                <TabsTrigger value="paste">Paste JD text</TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <div className="space-y-2">
                  <Label htmlFor="jd-url" className="text-sm font-medium text-slate-700">
                    Job posting URL
                  </Label>
                  <Input
                    id="jd-url"
                    type="url"
                    placeholder="https://stripe.com/jobs/listing/..."
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    className="bg-white"
                  />
                  <p className="text-xs text-slate-400">
                    We&apos;ll scrape the JD for you. Works with Greenhouse,
                    Lever, Workday, LinkedIn, and direct links.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="paste">
                <div className="space-y-2">
                  <Label htmlFor="jd-text" className="text-sm font-medium text-slate-700">
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
                  <span className="text-xs text-slate-400">
                    {jdText.length} chars
                    {jdText.length > 0 && jdText.length < 40 && (
                      <span className="text-amber-500 ml-1">
                        (need {40 - jdText.length} more)
                      </span>
                    )}
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </Section>

          <Separator />

          {/* Section C — Email */}
          <Section label="C" title="Email (optional)">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Your email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
              />
              <p className="text-xs text-slate-400">
                We&apos;ll email you a link to come back and edit later. Zero
                spam, no account created.
              </p>
            </div>
          </Section>

          <Separator />

          {/* Section D — PitchSage */}
          <Section label="D" title="PitchSage (optional)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Add a PM-style pitch to your portfolio
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    5 pages: problem, hypothesis, solution, metrics, tradeoffs
                  </p>
                </div>
                <Switch
                  checked={pitchEnabled}
                  onCheckedChange={setPitchEnabled}
                  aria-label="Enable PitchSage"
                />
              </div>

              {pitchEnabled && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-5">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
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
                          className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                            stance === opt.value
                              ? "border-violet-500 bg-violet-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <RadioGroupItem
                            id={`stance-${opt.value}`}
                            value={opt.value}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {opt.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {opt.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seed" className="text-sm font-medium text-slate-700">
                      Your seed observation
                    </Label>
                    <Textarea
                      id="seed"
                      rows={3}
                      placeholder="What's one thing you noticed about this company's product? Be specific. (1–3 sentences)"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="bg-white text-sm resize-none"
                    />
                    <p className="text-xs text-slate-400">
                      e.g. "Stripe's checkout mobile UX has friction at the
                      card-number step — the keyboard layout forces three taps to
                      enter expiry."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Submit */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className="w-full text-base"
          >
            {isPending ? "Submitting…" : "Generate my portfolio →"}
          </Button>
          {!canSubmit && !isPending && (
            <p className="text-xs text-slate-400 text-center">
              {profile.trim().length < 200 && "Profile must be 200+ chars. "}
              {!jdProvided && "Job description required."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  readonly label: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
          {label}
        </span>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
