import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authStore, useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Pact" },
      { name: "description", content: "Login to Pact to protect your habits and access your commitments." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await authStore.login({ identifier, password });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await authStore.logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="px-5 pt-10 pb-24">
      <div className="mx-auto max-w-xl space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.45)]">
        <div className="space-y-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Secure your habits</p>
          <h1 className="text-4xl font-bold">Sign in to Pact</h1>
          <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
            Access your active pacts, sync your account, and keep stakes on track. Use any email or handle to create a persistent account instantly.
          </p>
        </div>

        {auth ? (
          <div className="space-y-4 rounded-3xl border border-border bg-surface p-5">
            <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Current session</div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">{auth.name}</span>
              <span className="text-xs text-muted-foreground">{auth.email}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105"
              >
                Continue to dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-2"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-sm">
              <label htmlFor="identifier" className="block text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Email or handle
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or @habithero"
                className="input"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="password" className="block text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your secret phrase"
                className="input"
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">
                Password is optional for this login flow. Enter any text you like.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground ring-accent transition hover:brightness-105 disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Continue"}
            </button>
          </form>
        )}

        <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Quick login</p>
          <p className="mt-2">
            Use any email or handle to create an instant profile. Your account is saved locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
