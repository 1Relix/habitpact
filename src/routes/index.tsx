import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAccounts } from "@/lib/use-accounts";
import { accountStore } from "@/lib/account-store";
import { usePacts } from "@/lib/use-pacts";
import { pactStats, pactStore, dayKey, todayKey } from "@/lib/pact-store";
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
  const nav = useNavigate();
  const accounts = useAccounts();
  const currentAccount =
    accountStore.current() ?? accounts[0] ?? {
      id: "guest",
      name: "Demo account",
      handle: "@demo",
      balance: 0,
    };
  const pacts = usePacts();
  const totalAtRisk = pacts.reduce((a, p) => a + pactStats(p).atStake, 0);
  const totalSuccess = pacts.reduce((a, p) => a + pactStats(p).success, 0);
  const totalMissed = pacts.reduce((a, p) => a + pactStats(p).missed, 0);
  const totalDays = totalSuccess + totalMissed;
  const successRate = totalDays ? Math.round((totalSuccess / totalDays) * 100) : 0;
  const longestStreak = pacts.reduce((a, p) => Math.max(a, pactStats(p).streak), 0);
  const daysToDeadline = pacts
    .map((p) => {
      const end = new Date(p.startDate);
      end.setDate(end.getDate() + p.duration - 1);
      return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    })
    .filter((v) => v >= 0);
  const nextDeadline = daysToDeadline.length ? Math.min(...daysToDeadline) : 0;
  const riskLevel = totalAtRisk === 0 ? "Low" : totalAtRisk < 60 ? "Medium" : totalAtRisk < 150 ? "High" : "Critical";
  const riskClass =
    riskLevel === "Low"
      ? "bg-success/10 text-success"
      : riskLevel === "Medium"
      ? "bg-warning/10 text-warning"
      : riskLevel === "High"
      ? "bg-accent/10 text-accent"
      : "bg-danger/10 text-danger";

  const createDemoMode = () => {
    const startDate = todayKey();
    const demo = pactStore.create({
      title: "Daily cold shower",
      description: "Commit to the shock therapy before breakfast.",
      type: "build",
      verification: "manual",
      stake: 120,
      duration: 14,
      recipientName: "Demo Buddy",
      recipientHandle: "@demo",
      recipientKind: "person",
      recipientAccountId: accounts.find((account) => account.handle === "@demo")?.id,
      ownerAccountId: currentAccount.id,
      graceDays: 1,
      startDate,
    });

    [3, 2, 1].forEach((offset) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      pactStore.checkIn(demo.id, dayKey(d), true);
    });
    pactStore.checkIn(demo.id, dayKey(new Date()), false);
    nav({ to: "/pact/$id", params: { id: demo.id } });
  };

  return (
    <div className="px-5 pt-8">
      <div className="anim-up grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.45)]">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Risk monitoring system</p>
            <h1 className="mt-3 text-4xl font-bold">Money on the line.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              You are at risk of losing <span className="font-semibold text-accent">${Math.round(totalAtRisk)}</span> if you miss your next pact. This is not a to-do list — this is a commitment contract.
            </p>
          </div>

          <div className="rounded-3xl bg-surface p-4 text-sm">
            <div className="text-muted-foreground">Current account</div>
            <div className="mt-2 font-semibold">{currentAccount.name}</div>
            <div className="text-xs text-muted-foreground">{currentAccount.handle}</div>
            <div className="mt-3 text-2xl font-bold text-accent">${currentAccount.balance.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => nav({ to: "/new" })}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105"
          >
            New agreement
          </button>
          <button
            onClick={createDemoMode}
            className="rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-2"
          >
            Demo mode
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <StatPill label="Money at risk" value={`$${Math.round(totalAtRisk)}`} tone="accent" />
          <StatPill label="Deadline" value={nextDeadline === 0 ? "Today" : `${nextDeadline} days`} tone="muted" />
          <StatPill label="Success rate" value={`${successRate}%`} tone={successRate >= 70 ? "success" : "accent"} />
          <StatPill label="Max streak" value={`${longestStreak}d`} tone="muted" />
        </div>

        <div className="rounded-3xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
            <span>Consistency bar</span>
            <span>{successRate}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-success" style={{ width: `${successRate}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active pacts
        </h2>
        <Link to="/new" className="text-xs font-semibold text-accent">+ New agreement</Link>
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
          <span>Behavioral frame</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          {pacts.length === 0
            ? "A pact changes your identity: one small commitment today makes you someone who follows through tomorrow."
            : "Keep your stake top of mind. The next deadline is your warning signal — every day counts toward your consistency."}
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
