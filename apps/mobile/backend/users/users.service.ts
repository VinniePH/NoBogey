import { getSupabaseClient } from "../client";
import type { UpdateUserProfileInput, UserProfile } from "./users.types";

export async function getCurrentUserProfile(requestedRole?: 'golfer' | 'caddie'): Promise<UserProfile | null> {
  const client = getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) return null;
  const [{ data: profile, error }, { data: roles }] = await Promise.all([client.from("profiles").select("id,display_name,phone_e164,username,created_at").eq("id", auth.user.id).maybeSingle(), client.from("user_roles").select("role").eq("user_id", auth.user.id)]);
  if (error) throw error; if (!profile) return null;
  const available = new Set((roles ?? []).map((item) => item.role)); const role = requestedRole && available.has(requestedRole) ? requestedRole : available.has('caddie') ? 'caddie' : 'golfer';
  const [{ data: details, error: detailsError }, { count: completedRounds }, { data: ratings, error: ratingsError }] = await Promise.all([
    role === 'caddie' ? client.from('caddie_profiles').select('tagline,bio,years_experience,rate_amount_in_centavos,verification_status').eq('user_id',auth.user.id).maybeSingle() : client.from('golfer_profiles').select('handicap,bio').eq('user_id',auth.user.id).maybeSingle(),
    client.from('bookings').select('id',{count:'exact',head:true}).eq(role === 'caddie' ? 'caddie_id' : 'golfer_id',auth.user.id).eq('status','completed'),
    client.from('ratings').select('score').eq('ratee_id',auth.user.id)
  ]);
  if (detailsError) throw detailsError; if (ratingsError) throw ratingsError;
  const scores=(ratings??[]).map(item=>Number(item.score)); const averageRating=scores.length?scores.reduce((sum,value)=>sum+value,0)/scores.length:undefined;
  const base: UserProfile = { id:profile.id,role,displayName:profile.display_name,completedRounds:completedRounds??0,memberSince:profile.created_at,...(profile.phone_e164?{phoneNumber:profile.phone_e164}:{}),...(profile.username?{username:profile.username}:{}),...(auth.user.email?{email:auth.user.email}:{}),...(details?.bio?{bio:details.bio}:{}),...(averageRating!==undefined?{averageRating}:{}) };
  if (role === 'golfer') {
    const golfer = details as { handicap?: number | null } | null;
    return { ...base, ...(golfer?.handicap !== null && golfer?.handicap !== undefined ? { handicap: Number(golfer.handicap) } : {}) };
  }
  const caddie = details as { tagline?: string | null; years_experience?: number | null; rate_amount_in_centavos?: number | null; verification_status?: string } | null;
  return { ...base, ...(caddie?.tagline ? { tagline: caddie.tagline } : {}), yearsExperience:caddie?.years_experience??0, rateAmountInCentavos:Number(caddie?.rate_amount_in_centavos??0), ...(caddie?.verification_status ? { verificationStatus:caddie.verification_status } : {}) };
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
export async function submitCaddieOnboarding(draft: unknown): Promise<void> {
  const safeDraft = draft && typeof draft === "object" ? Object.fromEntries(Object.entries(draft).filter(([key]) => key !== "password")) : draft;
  const { error } = await getSupabaseClient().rpc("submit_caddie_onboarding", { p_draft: safeDraft });
  if (error) throw error;
}
export async function loadCaddieVerificationStatus(): Promise<{ status: string; note?: string; reviewedAt?: string } | null> {
  const client = getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) return null;
  const [{ data: profile, error }, { data: review }] = await Promise.all([
    client.from("caddie_profiles").select("verification_status").eq("user_id", auth.user.id).maybeSingle(),
    client.from("caddie_verification_reviews").select("reviewer_note,created_at").eq("caddie_id", auth.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  if (error) throw error; if (!profile) return null;
  return { status: profile.verification_status, ...(review?.reviewer_note ? { note: review.reviewer_note } : {}), ...(review?.created_at ? { reviewedAt: review.created_at } : {}) };
}
export async function loadPreferences<T>(): Promise<T | null> { const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) return null; const { data, error } = await getSupabaseClient().from("user_preferences").select("preferences").eq("user_id", auth.user.id).maybeSingle(); if (error) throw error; return (data?.preferences as T | undefined) ?? null; }
export async function savePreferences(preferences: Record<string, unknown>): Promise<void> { const client=getSupabaseClient(); const { data: auth } = await client.auth.getUser(); if (!auth.user) throw new Error("AUTH_REQUIRED"); const {data:existing}=await client.from("user_preferences").select("preferences").eq("user_id",auth.user.id).maybeSingle(); const merged={...((existing?.preferences as Record<string,unknown>|undefined)??{}),...preferences}; const { error } = await client.from("user_preferences").upsert({ user_id: auth.user.id, preferences:merged, updated_at: new Date().toISOString() }); if (error) throw error; }
