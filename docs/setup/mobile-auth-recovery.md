# Mobile Auth recovery and CAPTCHA

The mobile app sends confirmation and recovery emails to dedicated HTTPS bridge pages:

- `https://nobogeyofficial.com/mobile-auth/confirm`
- `https://nobogeyofficial.com/mobile-auth/recovery`

The bridge preserves the Supabase Auth callback parameters and opens `nobogey://auth/callback` or `nobogey://reset-password`. The mobile client uses PKCE, so the callback code is bound to the verifier stored on the device that requested the email. The Expo routes validate the exact scheme, host, and path before accepting a session. Recovery then calls `updateUser({ password })` and clears the local recovery session.

## Hosted Supabase settings

Keep both HTTPS bridge URLs and both `nobogey://` URLs in Auth > URL Configuration. Enable Cloudflare Turnstile in Auth > Bot and Abuse Protection using the secret paired with the site key used by `infra/cloudflare/nobogey-site-worker.js`. The repository equivalent is `SUPABASE_AUTH_CAPTCHA_SECRET`; never expose that value through an `EXPO_PUBLIC_` or `VITE_` variable.

The mobile and admin Auth clients send each single-use Turnstile token directly to Supabase for sign-up, password sign-in, and password recovery. Do not verify an Auth token through a separate endpoint first because Cloudflare tokens cannot be reused.

Deploy the hosted Auth CAPTCHA configuration before releasing the mobile build that contains this flow. The repository config alone does not change a hosted Supabase project.

## Branded recovery email

The recovery subject and HTML are defined in `supabase/config.toml` and `supabase/templates/recovery.html`. The hosted template should use `{{ .ConfirmationURL }}` so Supabase verifies the one-time recovery token before sending the user to the mobile bridge.

Changing the sender from `Supabase Auth` requires a production custom SMTP provider. NoBogey uses Resend SMTP with the verified sender `NoBogey Auth <no-reply@auth.nobogeyofficial.com>`. The `auth` subdomain isolates transactional-email reputation from the website. Keep the Resend SPF and DKIM records in Cloudflare as DNS-only records and disable click tracking for Auth emails. See [email delivery](./email-delivery.md) for the hosted configuration and verification procedure. Supabase projects created on the Free plan after June 3, 2026 cannot customize Auth templates while using the default email provider, so custom SMTP (or a paid plan) is required for the branded design.

Do not use `app.nobogey.io` unless NoBogey owns and verifies the `nobogey.io` domain. The currently owned namespace is `nobogeyofficial.com`; `app.nobogeyofficial.com` can be added later as a verified app/universal-link domain.
