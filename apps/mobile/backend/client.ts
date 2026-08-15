import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getBackendConfig } from './shared/config';

let supabaseClient: SupabaseClient | null = null;

/** Return the app-wide Supabase client with a persisted mobile Auth session. */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const { supabasePublishableKey, supabaseUrl } = getBackendConfig();
  supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: AsyncStorage
    }
  });

  return supabaseClient;
}
