import { useEffect, useState } from "react";
import { accountStore } from "./account-store";
import {
  isSupabaseEnabled,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
} from "./supabase";

const AUTH_KEY = "auth:session";
const AUTH_CHANGED = "auth:changed";

export type AuthSession = {
  accountId: string;
  email: string;
  name: string;
};

function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session === null) {
    window.localStorage.removeItem(AUTH_KEY);
  } else {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED));
}

function normalizeHandle(raw: string) {
  const text = raw.trim().toLowerCase();
  if (!text) return "";
  if (text.startsWith("@")) return text;
  return `@${text.replace(/[^a-z0-9_]/g, "")}`;
}

function normalizeEmail(raw: string) {
  const text = raw.trim().toLowerCase();
  if (!text) return "";
  if (text.includes("@")) return text;
  return `${text.replace(/[^a-z0-9_]/g, "")}@pact.local`;
}

function getDisplayName(raw: string) {
  const input = raw.trim();
  if (!input) return "You";
  if (input.includes("@")) {
    return input.split("@")[0] || "You";
  }
  return input.replace(/^@/, "");
}

export const authStore = {
  get() {
    return readAuthSession();
  },

  async logout() {
    if (isSupabaseEnabled) {
      await supabaseSignOut();
    }
    accountStore.setCurrent(null);
    writeAuthSession(null);
  },

  async login({ identifier, password }: { identifier: string; password?: string }) {
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      throw new Error("Enter an email address or handle.");
    }

    const handle = normalizeHandle(normalizedIdentifier);
    const email = normalizeEmail(normalizedIdentifier);
    const name = getDisplayName(normalizedIdentifier);

    const accounts = accountStore.list();
    let account = accounts.find(
      (account) =>
        account.handle.toLowerCase() === handle.toLowerCase() ||
        account.name.toLowerCase() === name.toLowerCase()
    );

    if (!account) {
      account = accountStore.create({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        handle,
        balance: 80,
      });
    }

    accountStore.setCurrent(account.id);

    if (isSupabaseEnabled && password && password.trim().length > 0) {
      const { error: signInError } = await supabaseSignIn(email, password);
      if (signInError) {
        const { error: signUpError } = await supabaseSignUp(email, password);
        if (signUpError) {
          throw new Error(signUpError.message || "Supabase authentication failed.");
        }
      }
    }

    const session: AuthSession = {
      accountId: account.id,
      email,
      name: account.name,
    };

    writeAuthSession(session);
    return session;
  },
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  useEffect(() => {
    const sync = () => setSession(readAuthSession());
    window.addEventListener(AUTH_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return session;
}
