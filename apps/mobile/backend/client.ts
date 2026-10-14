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
        // Email callbacks carry a one-time code bound to a verifier stored on
        // this device instead of exposing a reusable session in the deep link.
        flowType: 'pkce',
      },
    });
  }
  return client;
}

