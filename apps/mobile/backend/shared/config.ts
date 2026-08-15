export interface BackendConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

type PublicEnvironment = {
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
  EXPO_PUBLIC_SUPABASE_URL?: string | undefined;
};

/** Resolve the Expo-safe public values used by the mobile Supabase client. */
export function resolveBackendConfig(environment: PublicEnvironment): BackendConfig {
  const supabaseUrl = environment.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  if (!/^https?:\/\//u.test(supabaseUrl)) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL must be an absolute HTTP(S) URL.");
  }

  return { supabasePublishableKey, supabaseUrl };
}

/** Read backend configuration from Expo's public build-time environment. */
export function getBackendConfig(): BackendConfig {
  return resolveBackendConfig({
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL
  });
}
