import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { accountStore } from "@/lib/account-store";
import { authStore, useAuth } from "@/lib/auth-store";
import { pactStore } from "@/lib/pact-store";
import { useAccounts } from "@/lib/use-accounts";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Pact" },
      { name: "description", content: "Manage your Pact account, wallet balance, and trusted partners." },
    ],
  }),
  component: Settings,
});

const INTEGRATIONS = [
  { name: "Strava", emoji: "🏃", desc: "Verify runs, rides, workouts", connected: true },
  { name: "Apple Health", emoji: "❤️", desc: "Steps, workouts, sleep", connected: true },
  { name: "Google Fit", emoji: "🟢", desc: "Activity & step count", connected: false },
  { name: "iOS Screen Time", emoji: "📱", desc: "TikTok, Instagram, YouTube limits", connected: true },
  { name: "Android Digital Wellbeing", emoji: "🤖", desc: "App usage limits", connected: false },
];

function Settings() {
  const navigate = useNavigate();
  const auth = useAuth();
  const accounts = useAccounts();
  const current = accountStore.current();
  const [depositValue, setDepositValue] = useState(100);
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newBalance, setNewBalance] = useState(50);

  const partnerAccounts = useMemo(
    () => accounts.filter((account) => account.id !== current?.id),
    [accounts, current]
  );

  if (!auth || !current) {
    return (
      <div className="px-5 pt-8 text-center">
        <p className="text-sm text-muted-foreground">Settings are available only when signed in.</p>
        <h1 className="mt-3 text-3xl font-bold">Sign in to manage your account</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Your account preferences, balance, and linked pacts are tied to the signed-in profile.
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

  return (
    <div className="px-5 pt-8">
      <div className="anim-up">
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="display text-3xl font-bold">Settings</h1>
      </div>

      <div className="anim-up mt-5 rounded-3xl border border-border bg-card p-5 card-elev">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl">💼</div>
            <div>
              <div className="text-sm font-semibold">{current?.name || "Your account"}</div>
              <div className="text-xs text-muted-foreground">{current?.handle || "@you"}</div>
            </div>
          </div>
          <div className="rounded-3xl bg-surface px-4 py-3 text-sm">
            <div className="text-muted-foreground">Available balance</div>
            <div className="mt-1 text-2xl font-bold text-accent">
              ${current?.balance.toFixed(2) ?? "0.00"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[100, 250, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => accountStore.deposit(current.id, amount)}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-2"
            >
              Deposit ${amount}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            value={depositValue}
            onChange={(event) => setDepositValue(Number(event.target.value))}
            className="input max-w-[120px]"
            min={1}
          />
          <button
            onClick={() => accountStore.deposit(current.id, depositValue)}
            className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105"
          >
            Top up
          </button>
        </div>
      </div>

      <Section title="Accounts">
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              active={account.id === current?.id}
              onSwitch={() => accountStore.setCurrent(account.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Create partner account">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <input
            className="input"
            placeholder="Name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <input
            className="input"
            placeholder="Handle"
            value={newHandle}
            onChange={(event) => setNewHandle(event.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            className="input max-w-[120px]"
            min={0}
            value={newBalance}
            onChange={(event) => setNewBalance(Number(event.target.value))}
          />
          <button
            disabled={!newName || !newHandle}
            onClick={() => {
              if (!newName || !newHandle) return;
              accountStore.create({ name: newName, handle: newHandle, balance: newBalance });
              setNewName("");
              setNewHandle("");
              setNewBalance(50);
            }}
            className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground ring-accent hover:brightness-105 disabled:opacity-40"
          >
            Add account
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Create an accountability partner account that can receive real stake transfers when commitments fail.
        </p>
      </Section>

      <Section title="Verification integrations">
        {INTEGRATIONS.map((i) => (
          <Row key={i.name} {...i} />
        ))}
      </Section>

      <Section title="Preferences">
        <Toggle label="Daily check-in reminders" defaultOn />
        <Toggle label="Late-night scroll alerts" defaultOn />
        <Toggle label="Weekly insights email" />
        <Toggle label="Show me on leaderboard" defaultOn />
      </Section>

      <Section title="Danger zone">
        <button
          onClick={() => {
            void authStore.logout();
            navigate({ to: "/login" });
          }}
          className="w-full rounded-2xl border border-danger/30 bg-danger/5 p-4 text-left text-sm font-semibold text-danger"
        >
          Sign out
        </button>
        <button
          onClick={() => {
            if (!current) return;
            const confirmed = window.confirm(
              `Delete ${current.name} (${current.handle})? This cannot be undone.`
            );
            if (!confirmed) return;
            pactStore.removeByOwner(current.id);
            accountStore.remove(current.id);
            void authStore.logout();
            navigate({ to: "/login" });
          }}
          className="w-full rounded-2xl border border-danger/30 bg-danger/10 p-4 text-left text-sm font-semibold text-danger"
        >
          Delete account
        </button>
      </Section>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Pact v0.1 · Made with discipline
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function AccountRow({
  account,
  active,
  onSwitch,
}: {
  account: { id: string; name: string; handle: string; balance: number };
  active: boolean;
  onSwitch: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-semibold">{account.name}</div>
        <div className="text-xs text-muted-foreground">{account.handle}</div>
        <div className="mt-2 text-sm">Balance: ${account.balance.toFixed(2)}</div>
      </div>
      <div className="flex flex-wrap gap-3 sm:items-center">
        <button
          onClick={onSwitch}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            active ? "bg-accent text-accent-foreground" : "border border-border bg-surface hover:bg-surface-2"
          }`}
        >
          {active ? "Active" : "Switch"}
        </button>
        {!active ? (
          <button
            onClick={() => {
              const confirmed = window.confirm(
                `Delete ${account.name} (${account.handle})? This will remove the account from Pact.`
              );
              if (!confirmed) return;
              pactStore.removeByOwner(account.id);
              accountStore.remove(account.id);
            }}
            className="rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  name,
  emoji,
  desc,
  connected,
}: {
  name: string;
  emoji: string;
  desc: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          connected
            ? "bg-success/15 text-success"
            : "border border-border text-foreground"
        }`}
      >
        {connected ? "Connected" : "Connect"}
      </button>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultOn}
        className="h-5 w-9 appearance-none rounded-full bg-surface-2 transition-colors checked:bg-accent relative cursor-pointer
          before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform
          checked:before:translate-x-4"
      />
    </label>
  );
}
