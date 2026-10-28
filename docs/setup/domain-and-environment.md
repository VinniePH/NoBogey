# NoBogey domain and Expo environment

Create these project-level Expo variables for `development`, `preview`, and `production`:

| Name | Value | Visibility |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://api.nobogeyofficial.com` | Plain text |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_23-mM-DmFCanWE2j95jysw__N6GkJln` | Plain text |
| `EXPO_PUBLIC_APP_URL` | `https://nobogeyofficial.com` | Plain text |

Never put a Supabase secret or service-role key in an `EXPO_PUBLIC_` variable.

The Supabase custom domain is active. New builds and updates use `https://api.nobogeyofficial.com`.

## Supabase custom-domain DNS

`api.nobogeyofficial.com` is registered, verified, and active in Supabase.

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `api` | `tuprsezzpiworthbbygk.supabase.co` |
| TXT | `_acme-challenge.api` | Supabase ACME verification value |

With Cloudflare, set the CNAME to **DNS only** while verifying.

## Transactional-email DNS

Authentication and booking emails use the dedicated `auth.nobogeyofficial.com` sending domain through Resend. Cloudflare remains authoritative for its SPF, DKIM, and DMARC records. The record values are unique to the Resend account and must be copied exactly from the provider; see [email delivery](./email-delivery.md).

## Android App Links

The Android application ID is `com.anonymous.nobogeymobile`. Serve `https://nobogeyofficial.com/.well-known/assetlinks.json` with that package name and the production EAS signing certificate's SHA-256 fingerprint.
