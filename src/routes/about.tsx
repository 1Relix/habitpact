import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Pact" },
      { name: "description", content: "Learn how Pact helps you build habits with stake-based accountability and trusted partners." },
    ],
  }),
  component: About,
});

function About() {
  const auth = useAuth();

  return (
    <div className="px-5 pt-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-8 rounded-[2rem] border border-border bg-card p-8 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.45)]">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">About Pact</p>
          <h1 className="text-4xl font-bold">A habit tracker built to make commitment feel real.</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Pact blends behavioral science, trusted accountability, and a clean mobile-first experience so you can stay consistent with the habits that matter most.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold">Our mission</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              We believe habit change works best when small actions are supported by social accountability and meaningful consequences. Pact helps turn intentions into reliable routines by making every commitment feel more tangible.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              Your habits become more powerful when you stake actual value and invite someone you trust to hold you accountable.
            </p>
          </div>

          <div className="space-y-5 rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold">Why it works</h2>
            <ul className="space-y-4 text-sm leading-7 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Real stakes:</span> Money on the line makes follow-through easier to choose than avoidance.
              </li>
              <li>
                <span className="font-semibold text-foreground">Trusted partners:</span> Accountability feels safer when the people involved are people you respect.
              </li>
              <li>
                <span className="font-semibold text-foreground">Daily focus:</span> The app keeps habit progress simple, clear, and emotionally motivating every time you check in.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold">Built for people who want more than a checklist</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Stake-based accountability" value="Practice with consequences" />
            <StatCard label="Fast login" value="Create an account instantly" />
            <StatCard label="Focused design" value="Clean mobile and desktop experience" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold">How to use Pact</h3>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground list-decimal list-inside">
              <li>Sign in quickly with an email or handle.</li>
              <li>Create a pact with a daily habit and choose a stake.</li>
              <li>Pick someone you trust to receive the stake if you miss your goal.</li>
              <li>Check in every day and stay accountable to your plan.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold">Want to get started?</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Sign in, then create your first agreement. The Today tab becomes your command center for active pacts and account balance.
            </p>
            <Link
              to={auth ? "/" : "/login"}
              className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105"
            >
              {auth ? "You are signed in" : "Sign in to get started"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="mt-4 font-semibold leading-6">{value}</div>
    </div>
  );
}
