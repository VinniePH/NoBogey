# Expo and Codebase Setup Notes

This document explains how the NoBogey codebase was set up around Expo and the mobile-first monorepo foundation. It is reconstructed from the current repo state plus the foundation design and implementation plan in `docs/superpowers/`.

## Source Trail

The setup came from these repo artifacts:

- `NoBogey Project Overview.pdf`: product context for an on-demand golf caddie booking app.
- `docs/superpowers/specs/2026-07-06-monorepo-foundation-design.md`: approved direction for a mobile-first TypeScript monorepo.
- `docs/superpowers/plans/2026-07-06-monorepo-foundation-mobile-first.md`: implementation plan for the workspace, apps, packages, and docs.
- `README.md`: current quickstart and high-level repo summary.
- `docs/architecture/monorepo.md`: current architecture reference.
- `docs/api/backend-boundary.md`: deferred backend contract and ownership rules.

## Setup Direction

The first important decision was to make Expo mobile the active product surface instead of starting with a backend or admin tool. The repository is structured so the mobile app can move first while shared contracts and documentation keep the future backend boundary clear.

The foundation uses:

- `pnpm` workspaces for package management.
- Turborepo for root-level build, lint, typecheck, and test tasks.
- Expo, React Native, and Expo Router for the mobile app.
- A thin Vite React admin placeholder for future operations workflows.
- Shared TypeScript packages for contracts, UI tokens, config, and utilities.
- Local mock data in the mobile app until real backend persistence is added.

## Workspace Shape

```text
apps/
  mobile/
    Expo Router app and first active NoBogey product surface.
  admin-web/
    Vite React placeholder for future support and operations workflows.

packages/
  contracts/
    Framework-neutral TypeScript domain and API-facing types.
  config/
    Shared TypeScript configuration.
  ui/
    Shared mobile-safe design tokens.
  utils/
    App-neutral formatting and domain helpers.

docs/
  api/
    Backend boundary and future API ownership notes.
  architecture/
    Monorepo architecture notes.
  setup/
    Setup and local runbook documentation.
  superpowers/
    Design and planning history for the foundation work.
```

Apps can import shared packages. Shared packages should not import app code. `packages/contracts` stays framework-neutral so a future backend can implement the same domain language without depending on Expo or React.

## Monorepo Setup

The monorepo was set up before the Expo app details so every app and package could share one install, one lockfile, and one root command surface.

The setup sequence was:

1. Keep the repository root as the workspace owner with a private `package.json`.
2. Declare `pnpm@11.10.0` as the package manager.
3. Add `pnpm-workspace.yaml` so `apps/*` and `packages/*` are discovered automatically.
4. Add Turborepo so common commands can run from the root across all packages.
5. Add a root `tsconfig.json` with project references for shared packages and apps.
6. Add a shared TypeScript config package at `packages/config`.
7. Add framework-neutral contracts at `packages/contracts`.
8. Add shared UI tokens at `packages/ui`.
9. Add app-neutral helpers and tests at `packages/utils`.
10. Add `apps/mobile` as the first real app surface.
11. Add `apps/admin-web` as a placeholder for future operations work.
12. Add architecture and backend-boundary docs so backend decisions stay explicit but deferred.

The root workspace package is intentionally not an app. It owns orchestration only:

```json
{
  "name": "nobogey",
  "private": true,
  "packageManager": "pnpm@11.10.0"
}
```

Each app or package owns its own package name and scripts. Internal packages are imported with workspace dependencies such as:

```json
{
  "@nobogey/contracts": "workspace:*",
  "@nobogey/ui": "workspace:*",
  "@nobogey/utils": "workspace:*"
}
```

That means local package changes are resolved through the workspace instead of being published to a registry during development.

## Root Tooling Setup

The root package is private and declares `pnpm@11.10.0` as the package manager.

Root scripts are:

```bash
pnpm dev:mobile
pnpm dev:admin
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm clean
```

The workspace is declared in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Turborepo is configured in `turbo.json` with root tasks for `build`, `lint`, `typecheck`, `test`, `dev`, and `clean`. The root `tsconfig.json` uses project references to point at the shared packages and app projects.

## Expo Mobile Setup

The active mobile app lives at `apps/mobile` and is published inside the workspace as `@nobogey/mobile`.

The important Expo files are:

- `apps/mobile/package.json`: app scripts and Expo dependencies.
- `apps/mobile/app.json`: Expo app metadata, scheme, splash color, Android package, and plugins.
- `apps/mobile/babel.config.js`: Expo Babel preset.
- `apps/mobile/metro.config.js`: default Expo Metro config.
- `apps/mobile/app/_layout.tsx`: Expo Router stack, safe-area provider, status bar, and shared navigation styling.
- `apps/mobile/app/*.tsx`: file-based routes that point to feature screens.

The app uses `expo-router/entry` as its `main` field, which lets Expo Router own startup and file-based routing.

Key mobile dependencies currently include:

- `expo`
- `expo-router`
- `expo-dev-client`
- `expo-splash-screen`
- `expo-status-bar`
- `react`
- `react-native`
- `react-native-safe-area-context`
- `react-native-screens`
- `@expo/vector-icons`
- `@nobogey/contracts`
- `@nobogey/ui`
- `@nobogey/utils`

The Expo config in `app.json` sets:

- App name: `NoBogey`
- Slug: `nobogey-mobile`
- URL scheme: `nobogey`
- Android package: `com.anonymous.nobogeymobile`
- Splash background: `#1F7A4D`
- Web bundler: Metro
- Plugins: `expo-router` and `expo-splash-screen`

An Android native project exists under `apps/mobile/android`, which means the workspace is set up for a local Android development build instead of only Expo Go. That matches the presence of `expo-dev-client` in the mobile dependencies.

## Mobile Routes

Expo Router maps files in `apps/mobile/app` to screens:

| Route file | Screen | Purpose |
| --- | --- | --- |
| `app/index.tsx` | `HomeScreen` | Main golfer home surface, role switch, next booking, quick actions, preferred caddies, and open slots. |
| `app/courses.tsx` | `CourseSelectionScreen` | Course browsing and course selection placeholder. |
| `app/caddies.tsx` | `CaddieListingScreen` | Caddie list with profile summary, rating, rate, and home course. |
| `app/caddies/[id].tsx` | `CaddieProfileScreen` | Dynamic caddie profile route. |
| `app/booking.tsx` | `BookingPlaceholderScreen` | Booking review and placeholder flow. |
| `app/profile.tsx` | `GolferProfileScreen` | Golfer profile and history placeholder. |
| `app/caddie-dashboard.tsx` | `CaddieDashboardScreen` | Caddie-side dashboard placeholder. |

Feature implementations live under `apps/mobile/src/features`. Shared screen framing lives in `apps/mobile/src/ui/Screen.tsx`.

## Data Flow

The current mobile data flow is intentionally local:

```text
Expo route file
  -> feature screen
  -> apps/mobile/src/data/mock.ts
  -> packages/contracts types
  -> packages/ui tokens
  -> packages/utils formatting helpers
```

There is no live backend call yet. Mock data is typed with `@nobogey/contracts`, which keeps the mobile screens aligned with the future API shape.

Important domain types are defined in `packages/contracts/src/index.ts`, including:

- `Golfer`
- `Caddie`
- `GolfCourse`
- `AvailabilitySlot`
- `Booking`
- `Review`
- `PaymentIntent`
- `ApiError`

Utility helpers in `packages/utils` currently format Philippine peso amounts, format tee times in the `Asia/Manila` timezone, and check terminal booking states.

UI tokens in `packages/ui` define shared colors, spacing, radius, and typography values used by the mobile app and admin placeholder.

## Local Setup From a Fresh Clone

Install dependencies from the repo root:

```bash
pnpm install
```

Start the Expo development server:

```bash
pnpm dev:mobile
```

That root script runs:

```bash
pnpm --filter @nobogey/mobile dev
```

The mobile app's `dev` script runs:

```bash
expo start
```

For Android development builds, use:

```bash
pnpm --filter @nobogey/mobile android
```

That runs:

```bash
expo run:android
```

If a physical Android device or emulator cannot reach Metro on port `8081`, confirm the device is visible and reverse the Metro port:

```bash
adb devices
adb reverse tcp:8081 tcp:8081
pnpm dev:mobile
```

Use the current package name from `apps/mobile/package.json`: `@nobogey/mobile`.

## Admin Placeholder

The admin app lives at `apps/admin-web` as `@nobogey/admin-web`.

Run it with:

```bash
pnpm dev:admin
```

It is intentionally thin. Its purpose is to reserve a future home for caddie approval, booking support, course management, and payment dispute workflows while the active product work stays in Expo mobile.

## Backend Boundary

The backend runtime is intentionally not selected yet. The boundary is documented in `docs/api/backend-boundary.md`.

Future backend ownership includes:

- Persistence
- Authentication and role claims
- Permission checks
- Booking conflict checks
- Payment state
- GCash handoff and callbacks
- Audit trails
- External integrations

Mobile currently owns presentation, local placeholders, and mock-data-driven screen flow. Shared contracts define domain language but do not replace backend validation.

## Verification Commands

Use these from the repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Useful app-specific checks:

```bash
pnpm --filter @nobogey/mobile typecheck
pnpm --filter @nobogey/mobile lint
pnpm --filter @nobogey/mobile test
pnpm --filter @nobogey/admin-web build
```

## Common Maintenance Rules

- Add new mobile routes under `apps/mobile/app`.
- Put feature implementation under `apps/mobile/src/features/<feature>`.
- Keep app-neutral domain types in `packages/contracts`.
- Keep app-neutral formatting or state helpers in `packages/utils`.
- Keep shared visual tokens in `packages/ui`.
- Do not add backend-specific behavior to the mobile app.
- Keep mock data in `apps/mobile/src/data/mock.ts` typed by contracts until a real API client exists.
- Update `docs/api/backend-boundary.md` when mobile assumptions create new backend requirements.

## Current Scope Limits

The foundation does not include:

- Real authentication
- Real booking persistence
- Real caddie availability persistence
- Real payment processing
- GCash integration implementation
- Production backend framework selection
- Complete admin workflows

Those are intentionally deferred so the mobile product shape can lead the next implementation phase.
