import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

      {/* Stake hero */}
      <div className="anim-pop mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border bg-card p-5 card-elev">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">At stake</div>
          <div className="mt-1 display text-3xl font-bold gradient-text">${s.atStake.toFixed(0)}</div>
          <div className="mt-1 text-xs text-muted-foreground">of ${pact.stake}</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 card-elev">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Forfeited</div>
          <div className={`mt-1 display text-3xl font-bold ${s.forfeited > 0 ? "gradient-danger" : "text-success"}`}>
            ${s.forfeited.toFixed(0)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">to {pact.recipientName || "—"}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 rounded-3xl border border-border bg-surface/60 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {s.success + s.missed}/{pact.duration} days
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-accent to-success"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: pact.duration }).map((_, i) => {
            const v = Object.values(pact.checkins)[i];
            return (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  v === true ? "bg-success" : v === false ? "bg-danger" : "bg-surface-2"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Today */}
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

      {/* Recipient */}
      <div className="mt-4 rounded-3xl border border-border bg-surface/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-lg">
            {pact.recipientKind === "charity" ? "❤️" : "👤"}
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Money goes to
            </div>
            <div className="font-semibold">{pact.recipientName}</div>
            <div className="text-xs text-muted-foreground">{pact.recipientHandle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
