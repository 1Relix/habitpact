import { Link } from "@tanstack/react-router";
import { pactStats, todayKey, VERIFICATION_META, type Pact } from "@/lib/pact-store";

export function PactCard({ pact }: { pact: Pact }) {
  const s = pactStats(pact);
  const meta = VERIFICATION_META[pact.verification];
  const today = pact.checkins[todayKey()];
  const todayLabel =
    today === true ? "Done today" : today === false ? "Missed today" : "Pending today";
  const todayClass =
    today === true
      ? "bg-success/15 text-success"
      : today === false
      ? "bg-danger/15 text-danger"
      : "bg-surface-2 text-muted-foreground";
  const riskLevel =
    s.atStake === 0
      ? "Low"
      : s.atStake < pact.stake * 0.25
      ? "Medium"
      : s.atStake < pact.stake * 0.6
      ? "High"
      : "Critical";
  const riskClass =
    riskLevel === "Low"
      ? "bg-success/10 text-success"
      : riskLevel === "Medium"
      ? "bg-warning/10 text-warning"
      : riskLevel === "High"
      ? "bg-accent/10 text-accent"
      : "bg-danger/10 text-danger";

  return (
    <Link
      to="/pact/$id"
      params={{ id: pact.id }}
      className="group block anim-up"
    >
      <div className="card-elev relative overflow-hidden rounded-3xl border border-border bg-card p-5 transition-transform active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{meta.emoji}</span>
              <span className="truncate">{meta.label}</span>
            </div>
            <h3 className="mt-1 truncate text-lg font-semibold">{pact.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full px-2.5 py-1 text-muted-foreground bg-surface-2">Watching {pact.recipientName}</span>
              <span className={`rounded-full px-2.5 py-1 font-semibold ${riskClass}`}>{riskLevel} risk</span>
            </div>
          </div>
          <div className="text-right">
            <div className="display text-2xl font-bold gradient-text">${pact.stake}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">at stake</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium ${todayClass}`}>{todayLabel}</span>
          <span className="text-muted-foreground">
            🔥 <span className="font-semibold text-foreground">{s.streak}</span> streak ·{" "}
            {s.success}/{pact.duration} days
          </span>
        </div>

        <div className="mt-3 flex gap-1">
          {Array.from({ length: pact.duration }).map((_, i) => {
            const v = Object.values(pact.checkins)[i];
            return (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  v === true
                    ? "bg-success"
                    : v === false
                    ? "bg-danger"
                    : "bg-surface-2"
                }`}
              />
            );
          })}
        </div>
      </div>
    </Link>
  );
}
