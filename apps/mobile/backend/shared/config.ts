/** Expo public configuration used by the mobile backend modules. */
export interface BackendConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  appUrl: string;
}

interface PublicEnvironment {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  EXPO_PUBLIC_APP_URL?: string;
}

export function readBackendConfig(environment: PublicEnvironment): BackendConfig {
  const supabaseUrl = environment.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const appUrl = environment.EXPO_PUBLIC_APP_URL?.trim() || 'https://nobogeyofficial.com';

  if (!supabaseUrl) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
  if (!supabasePublishableKey) throw new Error('Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  return { supabaseUrl, supabasePublishableKey, appUrl };
}

/** Read Expo-safe public configuration. These values are embedded in the client bundle. */
export function getBackendConfig(): BackendConfig {
  return readBackendConfig({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    EXPO_PUBLIC_APP_URL: process.env.EXPO_PUBLIC_APP_URL,
  });
}

