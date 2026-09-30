# NoBogey

NoBogey is a golf caddie booking platform for golfers, caddies, and club operations. This mobile-first TypeScript monorepo contains an Expo mobile app, a React admin portal, a public website, shared packages, and a Supabase backend.

NoBogey is planned for release on the Google Play Store soon.

Updated September 30, 2026. This overview describes the repository implementation; it does not certify a production deployment or store release.

## Apps

| App | Stack | Scope |
| --- | --- | --- |
| [`apps/mobile`](apps/mobile) | Expo SDK 57, React Native, Expo Router | Golfer course discovery, tee-time and caddie selection, booking requests, caddie onboarding and verification, dashboard, settings, and in-app alerts. |
| [`apps/admin-web`](apps/admin-web) | Vite, React | Administrator sign-in, dashboard, tee-time calendar, fleet and assignments, compliance actions, and verification reviews. Local port: `8080`. |
| [`apps/landing-page`](apps/landing-page) | Vite, React, Tailwind CSS | Public landing page, role-specific get-started links, contact, privacy policy, and terms. Local port: `8082`. |

## Packages

- `packages/contracts`: Shared domain and API-facing TypeScript contracts.
- `packages/config`: Shared TypeScript configuration.
- `packages/ui`: Shared colors, typography, spacing, and other design tokens.
- `packages/utils`: Shared formatting and app-neutral helpers.

Apps consume shared packages through `workspace:*` dependencies. Shared packages remain independent of app-specific code.

## Local setup

Use pnpm **11.17.0**, as declared in the root `packageManager` field. Mobile EAS builds pin Node **22.22.2**; the GitHub Pages workflow uses Node **24**.

Install dependencies from the repository root:

```bash
pnpm install
```

Copy the example environment files for the apps you plan to run, then review their values for your target environment:

```bash
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin-web/.env.example apps/admin-web/.env
cp apps/landing-page/.env.example apps/landing-page/.env
```

| App | Environment variables |
| --- | --- |
| Mobile | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_APP_URL` |
| Admin | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_TURNSTILE_SITE_KEY` |
| Landing page | Optional golfer/caddie app-store and Android APK URLs, `VITE_ADMIN_WEB_URL`, and `VITE_CLUB_CONTACT_EMAIL`; see its `.env.example` for the exact names. |

Mobile and admin account/data flows require a configured Supabase project with the expected schema and RPCs. Public client variables are embedded in app bundles; keep service-role keys and server secrets out of them.

Admin authentication also calls `/api/turnstile/verify`. Mobile authentication uses the hosted `/mobile-captcha` page and verification endpoint. Starting Vite or Expo alone does not provide these external dependencies.

## Run the apps

From the repository root, start each app in its own terminal:

```bash
pnpm dev:mobile
pnpm dev:admin
pnpm --filter @nobogey/landing-page dev
```

You can also start mobile directly from its app directory:

```bash
cd apps/mobile
pnpm dev
```

The mobile package provides `pnpm android` and `pnpm ios` for local native builds. These require Android tooling or Xcode on macOS, respectively.

## Backend and current boundaries

[`supabase/`](supabase) contains database migrations, seed data, SQL tests, and the `send-booking-emails` Edge Function. Migrations cover profiles and roles, club/caddie records, availability, bookings, verification, preferences, notifications, and admin state.

- **Mobile:** Supabase Auth handles registration, sign-in, session restoration, and password recovery. Data adapters query courses, caddies, availability, and bookings; booking actions use database RPCs. Onboarding drafts, preferences, and in-app notifications also have Supabase integrations.
- **Admin:** Sign-in checks database roles. Fleet state is stored in `admin_portal_state` with a Realtime subscription; caddie enrollment, compliance, and verification actions call Supabase RPCs. Admin calendar state and mobile booking records use separate data paths, so complete scheduling synchronization still needs verification.
- **Remaining product work:** Booking submission does not collect payment. Some screens retain demo wording, local interaction state, or placeholder imagery, and account profile routes currently show a coming-soon screen. In-app alerts do not establish device push delivery.

The mobile adapter retains the filename `backend/mock.service.ts` and compatibility export `mobileMockService`, but its current implementation queries Supabase. Some source comments and older runbooks still describe the July/August mock foundation.

## Checks and builds

Run workspace checks from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For a focused check, use the package filter:

```bash
pnpm --filter @nobogey/mobile typecheck
pnpm --filter @nobogey/mobile test
pnpm --filter @nobogey/admin-web build
pnpm --filter @nobogey/landing-page build
```

`pnpm build` runs package build scripts through Turborepo. The mobile build script exports a web bundle; it does not create an Android APK or iOS binary.

## Android cloud builds

Run EAS commands from `apps/mobile`, using an Expo account with access to the configured project:

```bash
cd apps/mobile
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile preview
```

The `preview` profile creates an internal-distribution APK. For a production Android build, run this from the same app directory:

```bash
npx eas-cli@latest build --platform android --profile production
```

The production profile uses remote version management and automatic build-number increments. Building does not submit the app to Google Play. Configuration lives in [`apps/mobile/eas.json`](apps/mobile/eas.json) and [`apps/mobile/app.json`](apps/mobile/app.json); the Android application ID is currently `com.anonymous.nobogeymobile`.

## Website deployment

The [GitHub Pages workflow](.github/workflows/landing-pages.yml) builds the landing page and admin portal, copies the admin build into the site artifact, and deploys it on matching changes to `main` or a manual workflow run. It does not deploy the mobile app, Supabase migrations, or external authentication endpoints.

## Documentation

- [Environment and domain configuration](docs/setup/domain-and-environment.md)
- [Backend foundation and security boundaries](docs/backend/foundation.md)
- [Shared API boundary](docs/api/backend-boundary.md)
- [Caddie onboarding contract](docs/api/caddie-onboarding-contract.md)
- [Framework setup runbook](docs/setup/README.md)
- [Mobile release checklist](docs/release/README.md)

The framework setup, architecture, and release documents include historical foundation descriptions and validation snapshots. Use current manifests, app configuration, migrations, and source code to resolve conflicts; older snapshots do not establish current release readiness.
