import { describe, expect, it } from 'vitest';

import { parseMobileAuthCallback } from './auth-callback';

describe('mobile Auth callback validation', () => {
  it('parses a recovery session from the app fragment', () => {
    expect(parseMobileAuthCallback('nobogey://reset-password#access_token=access&refresh_token=refresh&type=recovery')).toEqual({
      kind: 'recovery',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('parses a PKCE code from the HTTPS recovery callback', () => {
    expect(parseMobileAuthCallback('https://nobogeyofficial.com/mobile-auth/recovery?code=abc123')).toEqual({
      kind: 'recovery',
      code: 'abc123',
    });
  });

  it('accepts only exact NoBogey callback origins and paths', () => {
    expect(parseMobileAuthCallback('https://attacker.example/mobile-auth/recovery#access_token=stolen')).toBeNull();
    expect(parseMobileAuthCallback('https://nobogeyofficial.com.evil.example/mobile-auth/recovery')).toBeNull();
    expect(parseMobileAuthCallback('nobogey://reset-password.evil.example#access_token=stolen')).toBeNull();
    expect(parseMobileAuthCallback('nobogey://reset-password/extra#access_token=stolen')).toBeNull();
  });

  it('returns callback errors without accepting a session', () => {
    expect(parseMobileAuthCallback('nobogey://reset-password#error=access_denied&error_description=Link+expired')).toEqual({
      kind: 'recovery',
      error: 'Link expired',
    });
  });
});
