import { getSupabaseClient } from "../client";

export async function loadCaddieOnboardingDraft<T>(): Promise<T | null> {
  const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return null;
  const { data, error } = await getSupabaseClient().from("caddie_onboarding_drafts").select("draft").eq("user_id", auth.user.id).maybeSingle();
  if (error) throw error; return (data?.draft as T | undefined) ?? null;
}
export async function saveCaddieOnboardingDraft(draft: unknown, submitted = false): Promise<void> {
  const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return;
  const { error } = await getSupabaseClient().from("caddie_onboarding_drafts").upsert({ user_id: auth.user.id, draft, updated_at: new Date().toISOString(), ...(submitted ? { submitted_at: new Date().toISOString() } : {}) });
  if (error) throw error;
}
export async function loadPreferences<T>(): Promise<T | null> { const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return null; const { data, error } = await getSupabaseClient().from("user_preferences").select("preferences").eq("user_id", auth.user.id).maybeSingle(); if (error) throw error; return (data?.preferences as T | undefined) ?? null; }
export async function savePreferences(preferences: unknown): Promise<void> { const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) throw new Error("AUTH_REQUIRED"); const { error } = await getSupabaseClient().from("user_preferences").upsert({ user_id: auth.user.id, preferences, updated_at: new Date().toISOString() }); if (error) throw error; }
