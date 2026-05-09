import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="display text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-3 text-lg font-semibold">This pact doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're chasing isn't here. Head back to your dashboard.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Don't worry — your pacts are safe. Try reloading.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1d22" },
      { title: "Pact — Stake your habits" },
      { name: "description", content: "Put money on your habits. Show up, or your stake goes to someone you trust. Inspired by Atomic Habits and behavioral psychology." },
      { property: "og:title", content: "Pact — Stake your habits" },
      { property: "og:description", content: "Put money on your habits. Show up, or your stake goes to someone you trust. Inspired by Atomic Habits and behavioral psychology." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pact — Stake your habits" },
      { name: "twitter:description", content: "Put money on your habits. Show up, or your stake goes to someone you trust. Inspired by Atomic Habits and behavioral psychology." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e3873baa-4836-4bab-8000-98c1cad9e7d4" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e3873baa-4836-4bab-8000-98c1cad9e7d4" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="dark min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const tabs = [
    { to: "/", label: "Today", icon: "🏠" },
    { to: "/analytics", label: "Stats", icon: "📈" },
    { to: "/new", label: "", icon: "+", primary: true },
    { to: "/social", label: "Friends", icon: "👯" },
    { to: "/settings", label: "Settings", icon: "⚙️" },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 md:hidden">
      <div className="glass card-elev flex items-center justify-around rounded-full border border-border px-2 py-1.5">
        {tabs.map((t) => {
          const active = path === t.to || (t.to !== "/" && path.startsWith(t.to));
          if (t.primary) {
            return (
              <Link
                key={t.to}
                to={t.to}
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground ring-accent transition-transform active:scale-95"
                aria-label="New pact"
              >
                {t.icon}
              </Link>
            );
          }
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto min-h-screen w-full max-w-[480px] md:max-w-[1200px] md:px-6 pb-32">
        <div className="hidden md:flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface/80 px-4 py-4 mb-6">
          <div className="text-xl font-semibold">Pact</div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link to="/" className="text-foreground transition hover:text-accent">Today</Link>
            <Link to="/analytics" className="transition hover:text-accent">Stats</Link>
            <Link to="/social" className="transition hover:text-accent">Friends</Link>
            <Link to="/settings" className="transition hover:text-accent">Settings</Link>
          </div>
          <Link
            to="/new"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
          >
            New pact
          </Link>
        </div>
        <Outlet />
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
}
