import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { pactStore, pactStats, todayKey, VERIFICATION_META } from "@/lib/pact-store";
import { usePacts } from "@/lib/use-pacts";

export const Route = createFileRoute("/pact/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Pact · ${params.id.slice(0, 6)}` },
      { name: "description", content: "Track your habit pact, check in daily, and protect your stake." },
    ],
  }),
  component: PactDetail,
});

function PactDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [partnerApproved, setPartnerApproved] = useState(false);
  const pacts = usePacts();
  const pact = pacts.find((p) => p.id === id);

  if (!pact) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-muted-foreground">Pact not found.</p>
        <Link to="/" className="mt-4 inline-block text-accent">Back to dashboard</Link>
      </div>
    );
  }

  const s = pactStats(pact);
  const tk = todayKey();
  const today = pact.checkins[tk];
  const meta = VERIFICATION_META[pact.verification];
  const progress = ((s.success + s.missed) / pact.duration) * 100;
  const deadline = new Date(pact.startDate);
  deadline.setDate(deadline.getDate() + pact.duration - 1);
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const completedDays = s.success + s.missed;
  const successRate = completedDays ? Math.round((s.success / completedDays) * 100) : 0;
  const isFailure = today === false && s.forfeited > 0;

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <button onClick={() => nav({ to: "/" })} className="text-sm text-muted-foreground">← Back</button>
        <button
          onClick={() => {
            if (confirm("End this pact?")) {
              pactStore.remove(pact.id);
              nav({ to: "/" });
            }
          }}
          className="text-xs text-danger"
        >
          End pact
        </button>
      </div>

      <div className="anim-up mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{meta.emoji}</span>
          <span>{meta.label}</span>
        </div>
        <h1 className="mt-1 display text-3xl font-bold">{pact.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pact.description}</p>
      </div>

      {isFailure && (
        <div className="mt-5 overflow-hidden rounded-[2rem] border border-danger/30 bg-danger/10 p-6 text-danger shadow-[0_0_50px_rgba(255,60,60,0.2)] shake">
          <div className="text-[11px] uppercase tracking-wider text-danger-foreground">Contract broken</div>
          <h2 className="mt-2 text-3xl font-bold">Commitment failed</h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground/90">
            You missed a day past your grace period. <span className="font-semibold">${s.forfeited.toFixed(0)}</span> has been transferred to {pact.recipientName}.
          </p>
          {pact.settlementHistory?.length ? (
            <div className="mt-5 rounded-3xl border border-danger/20 bg-danger/20 p-4 text-sm text-danger-foreground">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Transfer record</div>
              <div className="mt-2">
                {pact.settlementHistory[pact.settlementHistory.length - 1].amount.toFixed(2)} paid to {pact.settlementHistory[pact.settlementHistory.length - 1].toName}.
              </div>
            </div>
          ) : null}
          <div className="mt-5 flex items-center gap-3 rounded-3xl border border-danger/20 bg-danger/20 p-4 text-sm text-danger-foreground">
            <span className="text-xl">💔</span>
            <span>This failure is memorable. Use it to build stronger commitments next time.</span>
          </div>
        </div>
      )}

      <div className="anim-pop mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-5 card-elev">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Money at risk</div>
              <div className="mt-2 display text-4xl font-bold text-accent">${s.atStake.toFixed(0)}</div>
            </div>
            <div className="rounded-3xl bg-surface px-4 py-3 text-sm">
              <div className="text-muted-foreground">Deadline</div>
              <div className="mt-1 font-semibold">{daysRemaining === 0 ? "Today" : `${daysRemaining} days`}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DetailChip label="Success rate" value={`${successRate}%`} />
            <DetailChip label="Completed" value={`${completedDays}/${pact.duration}`} />
            <DetailChip label="Streak" value={`${s.streak}d`} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface/60 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Accountability partner</div>
          <div className="mt-3 text-xl font-semibold">{pact.recipientName}</div>
          <p className="mt-1 text-sm text-muted-foreground">Watching your progress and holding you to your word.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface-2 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{pact.recipientKind === "charity" ? "Charity" : "Partner"}</span>
            <span className="rounded-full bg-success/10 px-3 py-2 text-[11px] text-success">Watching your progress</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-surface/60 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Progress</span>
          <span>{(progress || 0).toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-gradient-to-r from-accent to-success" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Today</div>
            <div className="display text-lg font-bold">{tk}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">🔥 Streak</div>
            <div className="display text-xl font-bold text-accent">{s.streak}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => pactStore.checkIn(pact.id, tk, true)}
            className={`rounded-2xl py-4 text-sm font-semibold transition-colors ${
              today === true
                ? "bg-success text-success-foreground"
                : "border border-border bg-surface hover:bg-surface-2"
            }`}
          >
            ✓ I did it
          </button>
          <button
            onClick={() => pactStore.checkIn(pact.id, tk, false)}
            className={`rounded-2xl py-4 text-sm font-semibold transition-colors ${
              today === false
                ? "bg-danger text-danger-foreground"
                : "border border-border bg-surface hover:bg-surface-2"
            }`}
          >
            ✗ Missed
          </button>
        </div>
        {pact.verification !== "manual" && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Auto-verified via {meta.provider}. Tap to override.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-surface/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Check-in approval</div>
            <div className="font-semibold">{partnerApproved ? "Approved" : "Awaiting review"}</div>
            <p className="text-xs text-muted-foreground">Use this to keep accountability social and meaningful.</p>
          </div>
          <button
            onClick={() => setPartnerApproved((value) => !value)}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-2"
          >
            {partnerApproved ? "Revoke" : "Approve"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Demo tools</div>
            <div className="font-semibold">Simulate an outcome instantly</div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => pactStore.checkIn(pact.id, tk, true)}
            className="rounded-2xl bg-success px-4 py-4 text-sm font-semibold text-success-foreground hover:brightness-105"
          >
            Force success
          </button>
          <button
            onClick={() => pactStore.checkIn(pact.id, tk, false)}
            className="rounded-2xl bg-danger px-4 py-4 text-sm font-semibold text-danger-foreground hover:brightness-110"
          >
            Force failure
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4 text-sm">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
