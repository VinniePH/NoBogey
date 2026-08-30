import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getBackendConfig } from './shared/config';

let client: SupabaseClient | undefined;

/** Get the single persisted Supabase Auth/API client used by the mobile app. */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const { supabaseUrl, supabasePublishableKey } = getBackendConfig();
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

