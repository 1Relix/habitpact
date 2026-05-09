import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Friends — Pact" },
      { name: "description", content: "Accountability partners, group challenges, and the leaderboard." },
    ],
  }),
  component: Social,
});

const FRIENDS = [
  { name: "Maya", emoji: "🦊", streak: 28, saved: 320, status: "Crushed gym" },
  { name: "Devon", emoji: "🐻", streak: 14, saved: 180, status: "5km run done" },
  { name: "You", emoji: "🎯", streak: 9, saved: 90, status: "Phone locked at 10:30" },
  { name: "Priya", emoji: "🦋", streak: 7, saved: 70, status: "Read 30 min" },
  { name: "Theo", emoji: "🐺", streak: 3, saved: 0, status: "Missed run", danger: true },
];

const CHALLENGES = [
  { title: "No TikTok after 10pm", members: 12, prize: "$240 pool", emoji: "🌙" },
  { title: "5 runs this week", members: 8, prize: "$160 pool", emoji: "🏃" },
  { title: "Gym every weekday", members: 5, prize: "$500 pool", emoji: "💪" },
];

function Social() {
  return (
    <div className="px-5 pt-8">
      <div className="anim-up">
        <p className="text-sm text-muted-foreground">Stronger together</p>
        <h1 className="display text-3xl font-bold">Your circle</h1>
      </div>

      <div className="anim-up mt-5 rounded-3xl border border-border bg-card p-5 card-elev">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Leaderboard
          </h2>
          <span className="text-xs text-muted-foreground">This week</span>
        </div>
        <div className="mt-3 space-y-2">
          {FRIENDS.sort((a, b) => b.streak - a.streak).map((f, i) => {
            const isYou = f.name === "You";
            return (
              <div
                key={f.name}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  isYou ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
                }`}
              >
                <div className="w-5 text-center text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-lg">
                  {f.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{f.name}</span>
                    {isYou && (
                      <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                        you
                      </span>
                    )}
                  </div>
                  <div className={`truncate text-xs ${f.danger ? "text-danger" : "text-muted-foreground"}`}>
                    {f.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">🔥 {f.streak}</div>
                  <div className="text-[10px] text-muted-foreground">${f.saved} saved</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Group challenges
        </h2>
        <div className="mt-3 space-y-2">
          {CHALLENGES.map((c) => (
            <button
              key={c.title}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left hover:bg-surface-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-2xl">
                {c.emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c.members} members · {c.prize}
                </div>
              </div>
              <span className="text-xs font-semibold text-accent">Join →</span>
            </button>
          ))}
        </div>
      </div>

      <button className="mt-5 w-full rounded-full border border-border bg-surface py-3 text-sm font-semibold">
        + Invite a friend
      </button>
    </div>
  );
}
