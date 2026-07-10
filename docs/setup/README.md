# NoBogey Framework Setup README

This guide is the operational setup runbook for the NoBogey framework. Use it when setting up the repo from a fresh clone, starting the mobile or admin app, running verification checks, or preparing an Expo/EAS build.

## 1. What This Framework Contains

NoBogey is a mobile-first TypeScript monorepo for an on-demand golf caddie booking product.

```text
apps/
  mobile/      Expo React Native app with Expo Router
  admin-web/   Vite React placeholder for future operations workflows

packages/
  contracts/   Shared domain and API-facing TypeScript types
  config/      Shared TypeScript configuration
  ui/          Shared visual tokens
  utils/       Shared formatting and app-neutral helpers

docs/
  api/         Future backend boundary and ownership rules
  architecture/ Monorepo architecture notes
  setup/       Setup and local runbooks
```

The backend is intentionally deferred. Mobile screens currently use typed mock data while shared contracts preserve the future API language.

## 2. Prerequisites

Install or confirm these tools:

```bash
node --version
corepack --version
pnpm --version
git --version
```

Recommended versions:

- Node: `22.22.2` for EAS parity, based on `apps/mobile/eas.json`.
- pnpm: `11.10.0`, based on the root `packageManager` field.
- EAS CLI: `>= 20.5.1` if you will create Expo cloud builds.

Enable pnpm through Corepack when needed:

```bash
corepack enable
corepack prepare pnpm@11.10.0 --activate
```

Optional mobile tooling:

- Android Studio and an Android emulator for local Android development builds.
- Xcode on macOS for local iOS development builds.
- Expo account and EAS CLI for cloud builds.

## 3. Open The Correct Folder

The monorepo root is the nested `NoBogey` folder:

```bash
cd NoBogey
```

Run all workspace commands from this folder, where `package.json`, `pnpm-workspace.yaml`, and `turbo.json` live.

## 4. Install Dependencies

Install all workspace dependencies:

```bash
pnpm install
```

This installs dependencies for:

- `@nobogey/mobile`
- `@nobogey/admin-web`
- `@nobogey/contracts`
- `@nobogey/config`
- `@nobogey/ui`
- `@nobogey/utils`

Workspace packages are linked through `workspace:*`, so local package changes are available to apps without publishing.

## 5. Start The Mobile App

Start Expo from the workspace root:

```bash
pnpm dev:mobile
```

This runs:

```bash
pnpm --filter @nobogey/mobile dev
```

The mobile app script runs:

```bash
expo start
```

Common mobile targets:

```bash
pnpm --filter @nobogey/mobile web
pnpm --filter @nobogey/mobile android
pnpm --filter @nobogey/mobile ios
```

Notes:

- The app uses Expo Router through `expo-router/entry`.
- The native Android project exists at `apps/mobile/android`.
- Because `expo-dev-client` is installed, native development builds are available when Expo Go is not enough.

If an Android device or emulator cannot connect to Metro:

```bash
adb devices
adb reverse tcp:8081 tcp:8081
pnpm dev:mobile
```

## 6. Start The Admin Placeholder

Start the Vite admin app from the workspace root:

```bash
pnpm dev:admin
```

This runs:

```bash
pnpm --filter @nobogey/admin-web dev
```

The admin app is intentionally thin. It reserves a future home for support and operations workflows after backend permissions exist.

## 7. Run Verification Checks

Run the main checks from the workspace root:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Build everything that has a build task:

```bash
pnpm build
```

Useful package-specific checks:

```bash
pnpm --filter @nobogey/mobile lint
pnpm --filter @nobogey/mobile typecheck
pnpm --filter @nobogey/mobile test
pnpm --filter @nobogey/admin-web build
pnpm --filter @nobogey/utils test
```

## 8. Expo And EAS Setup

The mobile app config lives in:

- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/babel.config.js`
- `apps/mobile/metro.config.js`

Current Expo app settings:

- App name: `NoBogey`
- Slug: `nobogey-mobile`
- Scheme: `nobogey`
- Android package: `com.anonymous.nobogeymobile`
- Web bundler: Metro

Install and log in to EAS only when you need cloud builds:

```bash
npm install -g eas-cli
eas login
eas whoami
```

Preview Android APK build:

```bash
cd apps/mobile
eas build --profile preview --platform android
```

Production build:

```bash
cd apps/mobile
eas build --profile production --platform android
eas build --profile production --platform ios
```

The EAS config pins:

- Node: `22.22.2`
- pnpm: `11.10.0`
- Corepack: enabled
- Preview Android output: internal APK

## 9. Where To Put New Code

Use these rules when expanding the framework:

- Add Expo routes under `apps/mobile/app`.
- Put mobile feature implementation under `apps/mobile/src/features/<feature>`.
- Keep mobile-only data and placeholders under `apps/mobile/src`.
- Put domain and API-facing TypeScript types in `packages/contracts`.
- Put app-neutral formatting or state helpers in `packages/utils`.
- Put shared colors, spacing, typography, and radius tokens in `packages/ui`.
- Put shared TypeScript config in `packages/config`.
- Keep backend-specific implementation out of the mobile app until a backend runtime is selected.

Current mobile data flow:

```text
apps/mobile/app route
  -> apps/mobile/src/features screen
  -> apps/mobile/src/data/mock.ts
  -> packages/contracts types
  -> packages/ui tokens
  -> packages/utils helpers
```

## 10. Backend Boundary

The backend runtime is not selected yet. Future backend ownership is documented in:

```text
docs/api/backend-boundary.md
```

Backend-owned responsibilities include:

- Persistence
- Authentication and role claims
- Permission checks
- Booking conflict checks
- Payment state
- GCash handoff and callbacks
- Audit trails
- External integrations

Mobile currently owns presentation, local placeholders, and mock-data-driven flow only.

## 11. Troubleshooting

If dependencies feel out of sync:

```bash
pnpm install
pnpm typecheck
```

If Expo cache causes stale output:

```bash
pnpm --filter @nobogey/mobile start -- --clear
```

If Metro cannot resolve workspace packages, confirm you are running commands from the monorepo root and that `pnpm install` completed.

If Android cannot reach Metro:

```bash
adb reverse tcp:8081 tcp:8081
```

If a command fails only inside one package, run the filtered command directly so the error is easier to read:

```bash
pnpm --filter @nobogey/mobile typecheck
```

## 12. Setup Checklist

Use this checklist for a fresh machine:

```text
[ ] Install Node and enable Corepack
[ ] Activate pnpm 11.10.0
[ ] Open the nested NoBogey monorepo folder
[ ] Run pnpm install
[ ] Run pnpm typecheck
[ ] Run pnpm test
[ ] Start pnpm dev:mobile
[ ] Start pnpm dev:admin if admin work is needed
[ ] Install EAS CLI only if cloud builds are needed
[ ] Read docs/api/backend-boundary.md before adding backend assumptions
```

