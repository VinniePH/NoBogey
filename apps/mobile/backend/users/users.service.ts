import { getSupabaseClient } from "../client";
import type { UpdateUserProfileInput, UserProfile } from "./users.types";

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const client = getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) return null;
  const [{ data: profile, error }, { data: roles }] = await Promise.all([client.from("profiles").select("id,display_name,phone_e164").eq("id", auth.user.id).maybeSingle(), client.from("user_roles").select("role").eq("user_id", auth.user.id)]);
  if (error) throw error; if (!profile) return null; const role = roles?.some((item) => item.role === "caddie") ? "caddie" : "golfer";
  return { id: profile.id, role, displayName: profile.display_name, ...(profile.phone_e164 ? { phoneNumber: profile.phone_e164 } : {}) };
}
export async function updateCurrentUserProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
  const client = getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) throw new Error("AUTH_REQUIRED");
  const updates: Record<string,string|null> = {}; if (input.displayName !== undefined) updates.display_name = input.displayName.trim(); if (input.phoneNumber !== undefined) updates.phone_e164 = input.phoneNumber.trim() || null;
  const { error } = await client.from("profiles").update(updates).eq("id", auth.user.id); if (error) throw error; const result = await getCurrentUserProfile(); if (!result) throw new Error("PROFILE_NOT_FOUND"); return result;
}

export async function loadCaddieOnboardingDraft<T>(): Promise<T | null> {
  const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return null;
  const { data, error } = await getSupabaseClient().from("caddie_onboarding_drafts").select("draft").eq("user_id", auth.user.id).maybeSingle();
  if (error) throw error; return (data?.draft as T | undefined) ?? null;
}
export async function saveCaddieOnboardingDraft(draft: unknown, submitted = false): Promise<void> {
  const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return;
  const safeDraft = draft && typeof draft === "object" ? Object.fromEntries(Object.entries(draft).filter(([key]) => key !== "password")) : draft;
  const { error } = await getSupabaseClient().from("caddie_onboarding_drafts").upsert({ user_id: auth.user.id, draft: safeDraft, updated_at: new Date().toISOString(), ...(submitted ? { submitted_at: new Date().toISOString() } : {}) });
  if (error) throw error;
}
export async function loadPreferences<T>(): Promise<T | null> { const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return null; const { data, error } = await getSupabaseClient().from("user_preferences").select("preferences").eq("user_id", auth.user.id).maybeSingle(); if (error) throw error; return (data?.preferences as T | undefined) ?? null; }
export async function savePreferences(preferences: Record<string, unknown>): Promise<void> { const client=getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) throw new Error("AUTH_REQUIRED"); const {data:existing}=await client.from("user_preferences").select("preferences").eq("user_id",auth.user.id).maybeSingle(); const merged={...((existing?.preferences as Record<string,unknown>|undefined)??{}),...preferences}; const { error } = await client.from("user_preferences").upsert({ user_id: auth.user.id, preferences:merged, updated_at: new Date().toISOString() }); if (error) throw error; }
