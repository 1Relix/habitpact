import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Pact" },
      { name: "description", content: "Connect Strava, Apple Health, Screen Time, and your payment method." },
    ],
  }),
  component: Settings,
});

const INTEGRATIONS = [
  { name: "Strava", emoji: "🏃", desc: "Verify runs, rides, workouts", connected: true },
  { name: "Apple Health", emoji: "❤️", desc: "Steps, workouts, sleep", connected: true },
  { name: "Google Fit", emoji: "🟢", desc: "Activity & step count", connected: false },
  { name: "iOS Screen Time", emoji: "📱", desc: "TikTok, Instagram, YouTube limits", connected: true },
  { name: "Android Digital Wellbeing", emoji: "🤖", desc: "App usage limits", connected: false },
];

const PAYMENTS = [
  { name: "Stripe", emoji: "💳", desc: "Hold & transfer your stake", connected: true },
  { name: "Venmo", emoji: "💸", desc: "Pay friends instantly", connected: false },
  { name: "PayPal", emoji: "🅿️", desc: "Backup payout method", connected: false },
];

function Settings() {
  return (
    <div className="px-5 pt-8">
      <div className="anim-up">
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="display text-3xl font-bold">Settings</h1>
      </div>

      <div className="anim-up mt-5 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 card-elev">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          🎯
        </div>
        <div className="flex-1">
          <div className="font-semibold">Your Pact account</div>
          <div className="text-xs text-muted-foreground">you@example.com</div>
        </div>
        <button className="rounded-full border border-border px-3 py-1.5 text-xs">Edit</button>
      </div>

      <Section title="Verification integrations">
        {INTEGRATIONS.map((i) => (
          <Row key={i.name} {...i} />
        ))}
      </Section>

      <Section title="Payments">
        {PAYMENTS.map((i) => (
          <Row key={i.name} {...i} />
        ))}
      </Section>

      <Section title="Preferences">
        <Toggle label="Daily check-in reminders" defaultOn />
        <Toggle label="Late-night scroll alerts" defaultOn />
        <Toggle label="Weekly insights email" />
        <Toggle label="Show me on leaderboard" defaultOn />
      </Section>

      <Section title="Danger zone">
        <button className="w-full rounded-2xl border border-danger/30 bg-danger/5 p-4 text-left text-sm font-semibold text-danger">
          Sign out
        </button>
        <button className="w-full rounded-2xl border border-danger/30 bg-danger/10 p-4 text-left text-sm font-semibold text-danger">
          Delete account
        </button>
      </Section>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Pact v0.1 · Made with discipline
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({
  name,
  emoji,
  desc,
  connected,
}: {
  name: string;
  emoji: string;
  desc: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          connected
            ? "bg-success/15 text-success"
            : "border border-border text-foreground"
        }`}
      >
        {connected ? "Connected" : "Connect"}
      </button>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultOn} className="h-5 w-9 appearance-none rounded-full bg-surface-2 transition-colors checked:bg-accent relative cursor-pointer
        before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform
        checked:before:translate-x-4" />
    </label>
  );
}
