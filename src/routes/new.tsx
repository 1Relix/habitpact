import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { pactStore, VERIFICATION_META, type Verification } from "@/lib/pact-store";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New Pact" },
      { name: "description", content: "Create a new commitment with a money stake." },
    ],
  }),
  component: NewPact,
});

const HABIT_PRESETS: Array<{
  title: string;
  desc: string;
  type: "build" | "break";
  verification: Verification;
}> = [
  { title: "Run every day", desc: "At least 1 mile, tracked on Strava", type: "build", verification: "strava" },
  { title: "Hit the gym 5×/week", desc: "Apple Health workout for 30+ min", type: "build", verification: "apple_health" },
  { title: "Sleep before midnight", desc: "Tracked via your sleep app", type: "build", verification: "sleep" },
  { title: "TikTok < 20 min/day", desc: "Screen Time monitored daily", type: "break", verification: "screentime_tiktok" },
  { title: "Instagram < 15 min/day", desc: "Screen Time monitored daily", type: "break", verification: "screentime_instagram" },
  { title: "No YouTube Shorts", desc: "Screen Time on Shorts", type: "break", verification: "screentime_youtube" },
];

type Step = 1 | 2 | 3 | 4;

function NewPact() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "build" as "build" | "break",
    verification: "strava" as Verification,
    stake: 100,
    duration: 30,
    recipientName: "",
    recipientHandle: "",
    recipientKind: "person" as "person" | "charity",
    graceDays: 0,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const back = () => (step === 1 ? nav({ to: "/" }) : setStep((s) => (Math.max(1, s - 1) as Step)));

  const submit = () => {
    if (!form.title || !form.recipientName) return;
    pactStore.create({
      ...form,
      startDate: new Date().toISOString().slice(0, 10),
    });
    nav({ to: "/" });
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <button onClick={back} className="text-sm text-muted-foreground">← Back</button>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1.5 w-8 rounded-full ${
                n <= step ? "bg-accent" : "bg-surface-2"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Step
          title="Pick a habit"
          subtitle="Start with one that matters. You can stack more later."
        >
          <div className="space-y-2">
            {HABIT_PRESETS.map((h) => {
              const active = form.title === h.title;
              return (
                <button
                  key={h.title}
                  onClick={() => {
                    set("title", h.title);
                    set("description", h.desc);
                    set("type", h.type);
                    set("verification", h.verification);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg">
                      {VERIFICATION_META[h.verification].emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{h.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{h.desc}</div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider ${
                        h.type === "build" ? "text-success" : "text-danger"
                      }`}
                    >
                      {h.type === "build" ? "build" : "break"}
                    </span>
                  </div>
                </button>
              );
            })}
            <div className="pt-2">
              <Field label="Or write your own habit">
                <input
                  className="input"
                  placeholder="e.g. Read 30 minutes/day"
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    set("verification", "manual");
                  }}
                />
              </Field>
            </div>
          </div>
          <PrimaryAction disabled={!form.title} onClick={next}>Continue</PrimaryAction>
        </Step>
      )}

      {step === 2 && (
        <Step
          title="How will we verify?"
          subtitle="Auto-tracking keeps you honest. No screenshots, no excuses."
        >
          <div className="space-y-2">
            {(Object.keys(VERIFICATION_META) as Verification[]).map((v) => {
              const meta = VERIFICATION_META[v];
              const active = form.verification === v;
              return (
                <button
                  key={v}
                  onClick={() => set("verification", v)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface hover:bg-surface-2"
                  }`}
                >
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{meta.label}</div>
                    <div className="text-xs text-muted-foreground">via {meta.provider}</div>
                  </div>
                  {active && <span className="text-accent">✓</span>}
                </button>
              );
            })}
          </div>
          <PrimaryAction onClick={next}>Continue</PrimaryAction>
        </Step>
      )}

      {step === 3 && (
        <Step
          title="Set the stakes"
          subtitle="Loss aversion is real. Pick an amount that would actually hurt."
        >
          <Field label={`Stake — $${form.stake}`}>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={form.stake}
              onChange={(e) => set("stake", Number(e.target.value))}
              className="w-full accent-[oklch(0.86_0.16_88)]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>$20</span><span>$500</span><span>$1000</span>
            </div>
          </Field>

          <Field label={`Duration — ${form.duration} days`}>
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => set("duration", d)}
                  className={`flex-1 rounded-xl border p-2.5 text-sm font-semibold ${
                    form.duration === d
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Grace days — ${form.graceDays}`}>
            <p className="mb-2 text-xs text-muted-foreground">
              Free misses before money starts moving.
            </p>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((g) => (
                <button
                  key={g}
                  onClick={() => set("graceDays", g)}
                  className={`flex-1 rounded-xl border p-2.5 text-sm font-semibold ${
                    form.graceDays === g
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <div className="rounded-2xl border border-border bg-surface/60 p-4 text-xs text-muted-foreground">
            If you miss a day past your grace,{" "}
            <span className="font-semibold text-foreground">
              ${(form.stake / form.duration).toFixed(2)}
            </span>{" "}
            of your stake transfers to your trusted recipient.
          </div>

          <PrimaryAction onClick={next}>Continue</PrimaryAction>
        </Step>
      )}

      {step === 4 && (
        <Step
          title="Who's holding you to it?"
          subtitle="Money goes to them — not back to you — if you slip."
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => set("recipientKind", "person")}
              className={`rounded-2xl border p-4 text-left ${
                form.recipientKind === "person"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-2xl">👤</div>
              <div className="mt-1 font-semibold">Person</div>
              <div className="text-xs text-muted-foreground">Friend or family</div>
            </button>
            <button
              onClick={() => set("recipientKind", "charity")}
              className={`rounded-2xl border p-4 text-left ${
                form.recipientKind === "charity"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-2xl">❤️</div>
              <div className="mt-1 font-semibold">Charity</div>
              <div className="text-xs text-muted-foreground">Pick a cause</div>
            </button>
          </div>

          <Field label={form.recipientKind === "person" ? "Their name" : "Charity name"}>
            <input
              className="input"
              placeholder={form.recipientKind === "person" ? "e.g. Mom" : "e.g. Doctors Without Borders"}
              value={form.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
            />
          </Field>
          <Field label={form.recipientKind === "person" ? "Email or @handle" : "Website"}>
            <input
              className="input"
              placeholder={form.recipientKind === "person" ? "mom@email.com" : "doctorswithoutborders.org"}
              value={form.recipientHandle}
              onChange={(e) => set("recipientHandle", e.target.value)}
            />
          </Field>

          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-5">
            <div className="text-xs uppercase tracking-wider text-accent">Your pact</div>
            <h3 className="mt-1 display text-xl font-bold">{form.title || "—"}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Mini label="Stake" value={`$${form.stake}`} />
              <Mini label="Days" value={String(form.duration)} />
              <Mini label="Per miss" value={`$${(form.stake / form.duration).toFixed(0)}`} />
            </div>
          </div>

          <PrimaryAction
            disabled={!form.recipientName}
            onClick={submit}
          >
            Lock in pact — ${form.stake}
          </PrimaryAction>
          <Link to="/" className="block text-center text-xs text-muted-foreground">
            Cancel
          </Link>
        </Step>
      )}
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="anim-up mt-6 space-y-5">
      <div>
        <h1 className="display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface/70 p-2">
      <div className="display text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function PrimaryAction({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-full bg-accent py-4 text-sm font-semibold text-accent-foreground ring-accent disabled:opacity-40 disabled:ring-0"
    >
      {children}
    </button>
  );
}
