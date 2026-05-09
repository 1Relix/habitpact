export type Verification =
  | "strava"
  | "apple_health"
  | "google_fit"
  | "screentime_tiktok"
  | "screentime_instagram"
  | "screentime_youtube"
  | "sleep"
  | "manual";

export type Pact = {
  id: string;
  title: string;
  description: string;
  type: "build" | "break";
  verification: Verification;
  stake: number;
  duration: number; // days
  startDate: string; // ISO date
  recipientName: string;
  recipientHandle: string;
  recipientKind: "person" | "charity";
  graceDays: number;
  // map of yyyy-mm-dd -> true (success) | false (miss) | undefined (pending)
  checkins: Record<string, boolean>;
  createdAt: string;
};

const KEY = "pact:v1";

function read(): Pact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Pact[]) : [];
  } catch {
    return [];
  }
}

function write(pacts: Pact[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(pacts));
  window.dispatchEvent(new CustomEvent("pact:changed"));
}

export const pactStore = {
  list: read,
  get(id: string) {
    return read().find((p) => p.id === id);
  },
  create(input: Omit<Pact, "id" | "createdAt" | "checkins">) {
    const p: Pact = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      checkins: {},
    };
    write([p, ...read()]);
    return p;
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id));
  },
  checkIn(id: string, dateKey: string, success: boolean) {
    write(
      read().map((p) =>
        p.id === id
          ? { ...p, checkins: { ...p.checkins, [dateKey]: success } }
          : p
      )
    );
  },
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function pactStats(p: Pact) {
  const success = Object.values(p.checkins).filter((v) => v === true).length;
  const missed = Object.values(p.checkins).filter((v) => v === false).length;
  const remaining = Math.max(0, p.duration - success - missed);
  const perDay = p.stake / p.duration;
  const forfeited = Math.min(p.stake, perDay * Math.max(0, missed - p.graceDays));
  const atStake = Math.max(0, p.stake - forfeited);
  // streak — count consecutive successes ending today (or last logged)
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < p.duration; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const v = p.checkins[dayKey(d)];
    if (v === true) streak++;
    else if (v === false) break;
    else if (i > 0) break;
  }
  return { success, missed, remaining, forfeited, atStake, streak, perDay };
}

export const VERIFICATION_META: Record<
  Verification,
  { label: string; emoji: string; provider: string; type: "build" | "break" }
> = {
  strava: { label: "Strava activity", emoji: "🏃", provider: "Strava", type: "build" },
  apple_health: { label: "Apple Health", emoji: "❤️", provider: "Apple Health", type: "build" },
  google_fit: { label: "Google Fit", emoji: "🟢", provider: "Google Fit", type: "build" },
  screentime_tiktok: { label: "TikTok screen time", emoji: "🎵", provider: "Screen Time", type: "break" },
  screentime_instagram: { label: "Instagram screen time", emoji: "📸", provider: "Screen Time", type: "break" },
  screentime_youtube: { label: "YouTube Shorts time", emoji: "▶️", provider: "Screen Time", type: "break" },
  sleep: { label: "Sleep before midnight", emoji: "😴", provider: "Sleep tracker", type: "build" },
  manual: { label: "Manual check-in", emoji: "✍️", provider: "Manual", type: "build" },
};
