import { createFileRoute, Link } from "@tanstack/react-router";
import { usePacts } from "@/lib/use-pacts";
import { pactStats } from "@/lib/pact-store";
import { PactCard } from "@/components/PactCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Pact" },
      { name: "description", content: "Your active pacts, today's check-ins, and money on the line." },
    ],
  }),
  component: Dashboard,
});

function Greeting() {
  const h = new Date().getHours();
  const t = h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return <>{t}</>;
}

function Dashboard() {
  const pacts = usePacts();
  const totalStake = pacts.reduce((a, p) => a + pactStats(p).atStake, 0);
  const saved = pacts.reduce((a, p) => a + pactStats(p).success * (p.stake / p.duration), 0);
  const longestStreak = pacts.reduce((a, p) => Math.max(a, pactStats(p).streak), 0);

  return (
    <div className="px-5 pt-8">
      <div className="anim-up flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Greeting />,
          </p>
          <h1 className="display text-3xl font-bold">Stay in the game.</h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold">
          🎯
        </div>
      </div>

      {/* Stats hero */}
      <div className="anim-up mt-6 grid grid-cols-3 gap-2">
        <StatPill label="At stake" value={`$${Math.round(totalStake)}`} tone="accent" />
        <StatPill label="Saved" value={`$${Math.round(saved)}`} tone="success" />
        <StatPill label="Best streak" value={`${longestStreak}d`} tone="muted" />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active pacts
        </h2>
        <Link to="/new" className="text-xs font-semibold text-accent">+ New</Link>
      </div>

      {pacts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-3 space-y-3">
          {pacts.map((p) => (
            <PactCard key={p.id} pact={p} />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-border bg-surface/40 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span>💡</span>
          <span>Coach</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          {pacts.length === 0
            ? "Make it small. Pick one habit and stake an amount that would actually sting if you lost it."
            : "You scroll most between 10pm–midnight. Try locking your phone at 10:30 — your stake says thanks."}
        </p>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "success" | "muted";
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "success"
      ? "text-success"
      : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 card-elev">
      <div className={`display text-xl font-bold ${toneClass}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="anim-pop mt-4 overflow-hidden rounded-3xl border border-border bg-card p-6 text-center card-elev">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl">
        🤝
      </div>
      <h3 className="mt-4 display text-xl font-bold">Make your first pact</h3>
      <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted-foreground">
        Pick a habit. Stake real money. Lose it to someone you trust if you flake.
      </p>
      <Link
        to="/new"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
      >
        Start a pact
      </Link>
    </div>
  );
}
