import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { useAccounts } from "@/lib/use-accounts";
import { accountStore } from "@/lib/account-store";
import { usePacts } from "@/lib/use-pacts";
import { pactStats } from "@/lib/pact-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Pact" },
      { name: "description", content: "See your habit consistency, money saved, and risk patterns." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const auth = useAuth();
  useAccounts();
  const currentAccount = accountStore.current();

  if (!auth || !currentAccount) {
    return (
      <div className="px-5 pt-8 text-center">
        <p className="text-sm text-muted-foreground">Stats are private to signed-in accounts.</p>
        <h1 className="mt-3 text-3xl font-bold">Sign in to view your analytics</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Your habit performance and success rate are shown only when you're signed in to a specific account.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const pacts = usePacts(currentAccount.id);
  const totalSuccess = pacts.reduce((a, p) => a + pactStats(p).success, 0);
  const totalMissed = pacts.reduce((a, p) => a + pactStats(p).missed, 0);
  const totalDays = totalSuccess + totalMissed;
  const successRate = totalDays ? Math.round((totalSuccess / totalDays) * 100) : 0;
  const bestStreak = pacts.reduce((a, p) => Math.max(a, pactStats(p).streak), 0);

  return (
    <div className="px-5 pt-8">
      <div className="anim-up">
        <p className="text-sm text-muted-foreground">Accountability metrics</p>
        <h1 className="display text-3xl font-bold">Behavioral performance</h1>
      </div>

      <div className="anim-up mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Best streak" value={`${bestStreak}d`} />
        <MetricCard label="Success rate" value={`${successRate}%`} />
        <MetricCard label="Days completed" value={`${totalSuccess} / ${totalMissed}`} />
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5 card-elev">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Why it matters</div>
        <h2 className="mt-2 text-lg font-bold">Identity over habit</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          These numbers are not just performance stats. They show whether you are becoming someone who keeps commitments and protects your money from loss.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}
