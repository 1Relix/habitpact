import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        storage: undefined,
      },
    })
  : null;

export async function supabaseGetSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("Supabase session read failed", error.message);
    return null;
  }
  return data.session;
}

export async function supabaseSignIn(email: string, password: string) {
  if (!supabase) return { session: null, error: new Error("Supabase not configured") };
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function supabaseSignUp(email: string, password: string) {
  if (!supabase) return { session: null, error: new Error("Supabase not configured") };
  return await supabase.auth.signUp({ email, password });
}

export async function supabaseSignOut() {
  if (!supabase) return null;
  return await supabase.auth.signOut();
}
