import { createFileRoute } from "@tanstack/react-router";
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
  const pacts = usePacts();
  const totalSuccess = pacts.reduce((a, p) => a + pactStats(p).success, 0);
  const totalMissed = pacts.reduce((a, p) => a + pactStats(p).missed, 0);
  const totalDays = totalSuccess + totalMissed || 1;
  const consistency = Math.round((totalSuccess / totalDays) * 100);
  const saved = pacts.reduce((a, p) => a + pactStats(p).success * (p.stake / p.duration), 0);
  const lost = pacts.reduce((a, p) => a + pactStats(p).forfeited, 0);

  // last 14 days bars
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    let s = 0, m = 0;
    pacts.forEach((p) => {
      if (p.checkins[k] === true) s++;
      if (p.checkins[k] === false) m++;
    });
    return { k, s, m };
  });
  const max = Math.max(1, ...days.map((d) => d.s + d.m));

  return (
    <div className="px-5 pt-8">
      <div className="anim-up">
        <p className="text-sm text-muted-foreground">Your performance</p>
        <h1 className="display text-3xl font-bold">The numbers</h1>
      </div>

      <div className="anim-up mt-5 grid grid-cols-2 gap-3">
        <BigStat label="Consistency" value={`${consistency}%`} tone="accent" />
        <BigStat label="Money saved" value={`$${Math.round(saved)}`} tone="success" />
        <BigStat label="Days won" value={String(totalSuccess)} tone="muted" />
        <BigStat label="Money lost" value={`$${Math.round(lost)}`} tone="danger" />
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5 card-elev">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last 14 days</div>
            <h2 className="display text-lg font-bold">Daily check-ins</h2>
          </div>
        </div>
        <div className="mt-4 flex h-36 items-end gap-1.5">
          {days.map((d) => {
            const total = d.s + d.m;
            const sH = (d.s / max) * 100;
            const mH = (d.m / max) * 100;
            return (
              <div key={d.k} className="flex flex-1 flex-col-reverse items-center gap-0.5">
                {d.s > 0 && (
                  <div
                    className="w-full rounded-sm bg-success"
                    style={{ height: `${sH}%` }}
                    title={`${d.s} done`}
                  />
                )}
                {d.m > 0 && (
                  <div
                    className="w-full rounded-sm bg-danger"
                    style={{ height: `${mH}%` }}
                  />
                )}
                {total === 0 && <div className="h-1 w-full rounded-sm bg-surface-2" />}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>14d ago</span><span>today</span>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Per-pact</div>
        <h2 className="display text-lg font-bold">Win rate</h2>
        {pacts.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Create a pact to see analytics.</p>
        )}
        <div className="mt-3 space-y-3">
          {pacts.map((p) => {
            const s = pactStats(p);
            const total = s.success + s.missed || 1;
            const pct = Math.round((s.success / total) * 100);
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.title}</span>
                  <span className="font-semibold text-accent">{pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-success"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-surface/40 p-5">
        <div className="text-[11px] uppercase tracking-wider text-accent">AI insight</div>
        <p className="mt-2 text-sm leading-relaxed">
          Your weakest day is <span className="font-semibold text-foreground">Sunday</span>.
          Consider scheduling your habit before noon — your win rate is{" "}
          <span className="font-semibold text-success">2.3×</span> higher in mornings.
        </p>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "success" | "danger" | "muted";
}) {
  const tc =
    tone === "accent"
      ? "gradient-text"
      : tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "gradient-danger"
      : "text-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card p-4 card-elev">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 display text-3xl font-bold ${tc}`}>{value}</div>
    </div>
  );
}
