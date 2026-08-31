import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "https://api.nobogeyofficial.com";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "sb_publishable_23-mM-DmFCanWE2j95jysw__N6GkJln";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { autoRefreshToken: true, detectSessionInUrl: true, persistSession: true },
});

export async function hasAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).some(({ role }) => role === "super_admin" || role === "club_admin");
}
