export type MobileAuthCallbackKind = 'confirmation' | 'recovery';

export interface ParsedMobileAuthCallback {
  kind: MobileAuthCallbackKind;
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  error?: string;
}

const HTTPS_CALLBACK_HOST = 'nobogeyofficial.com';
const CALLBACK_ROUTES: Record<string, MobileAuthCallbackKind> = {
  '/auth/callback': 'confirmation',
  '/mobile-auth/confirm': 'confirmation',
  '/mobile-auth/recovery': 'recovery',
  '/reset-password': 'recovery',
};
const APP_PROTOCOLS = new Set(['nobogey:', 'exp+nobogey-mobile:']);

function routeFor(candidate: URL): string {
  if (APP_PROTOCOLS.has(candidate.protocol)) {
    return `/${candidate.hostname}${candidate.pathname}`.replace(/\/$/, '') || '/';
  }
  return candidate.pathname.replace(/\/$/, '') || '/';
}

function mergedParams(candidate: URL): URLSearchParams {
  const params = new URLSearchParams(candidate.search);
  const fragment = new URLSearchParams(candidate.hash.replace(/^#/, ''));
  fragment.forEach((value, key) => params.set(key, value));
  return params;
}

/** Parse only the exact HTTPS and app-scheme callbacks owned by NoBogey. */
export function parseMobileAuthCallback(url: string): ParsedMobileAuthCallback | null {
  try {
    const candidate = new URL(url);
    const isAppCallback = APP_PROTOCOLS.has(candidate.protocol)
      && !candidate.username
      && !candidate.password
      && !candidate.port;
    const isHttpsCallback = candidate.protocol === 'https:'
      && candidate.hostname === HTTPS_CALLBACK_HOST
      && !candidate.username
      && !candidate.password
      && !candidate.port;
    if (!isAppCallback && !isHttpsCallback) return null;

    const kind = CALLBACK_ROUTES[routeFor(candidate)];
    if (!kind) return null;
    const params = mergedParams(candidate);
    const errorDescription = params.get('error_description') ?? params.get('error');
    return {
      kind,
      ...(params.get('access_token') ? { accessToken: params.get('access_token')! } : {}),
      ...(params.get('refresh_token') ? { refreshToken: params.get('refresh_token')! } : {}),
      ...(params.get('code') ? { code: params.get('code')! } : {}),
      ...(errorDescription ? { error: errorDescription.replace(/\+/g, ' ') } : {}),
    };
  } catch {
    return null;
  }
}

/** Establish the short-lived Supabase session delivered by an Auth email callback. */
export async function establishSessionFromMobileAuthCallback(url: string, expectedKind: MobileAuthCallbackKind): Promise<void> {
  const callback = parseMobileAuthCallback(url);
  if (!callback || callback.kind !== expectedKind) throw new Error('This authentication link is not valid for this screen.');
  if (callback.error) throw new Error(callback.error);

  const { getSupabaseClient } = await import('../client');
  const client = getSupabaseClient();
  if (callback.code) {
    const { error } = await client.auth.exchangeCodeForSession(callback.code);
    if (error) throw error;
    return;
  }
  if (callback.accessToken && callback.refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    if (error) throw error;
    return;
  }
  throw new Error('This authentication link is incomplete or has expired. Request a new email and try again.');
}
