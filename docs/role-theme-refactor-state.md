# Role and Theme Refactor State

## Purpose and terminal status

This document records the inspection and decision trail for the requested
frontend-only role-route and theme refactor. It is intentionally separate from
`AGENTS.md`, which remains durable guidance for future contributors.

**Current status: route-tree separation implemented; role guards remain
`BLOCKED_BY_PROJECT_AMBIGUITY`.**

The requested role guards and caddie verification routing require authenticated
role and verification data. Neither is available from the current session
contract or a wired API contract. Implementing the guards now would require
treating mock, device-selected state as authenticated production data.

## Initial inspection — 2026-08-04

### Working tree

- Repository: pnpm/Turborepo monorepo; branch `staging`, two commits ahead of
  `origin/staging` at inspection time.
- Existing untracked files: root `AGENTS.md` and root `app.json`.
- The root `app.json` is unrelated and was not modified.
- One applicable `AGENTS.md` was found at the repository root; no nested
  `AGENTS.md` files were found. Its existing rules cover monorepo structure,
  commands, TypeScript style, testing, and commit hygiene. It does not yet
  document the requested role-route or theme architecture.

### Existing architecture and routes

- Frontend application: `apps/mobile`, using Expo Router filesystem routes.
- Expo config: `apps/mobile/app.json`; Babel and Metro use the standard Expo
  presets/configuration.
- Installed versions discovered from the local dependency tree:
  - Expo `57.0.8`
  - Expo Router `57.0.8`
  - React Native `0.86.2`
  - TypeScript `6.0.3`
- The mobile TypeScript config is strict through
  `@nobogey/config/typescript/base`, with `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`; it includes `app`, `src`, `backend`, and
  scripts. No TypeScript path alias is declared in the mobile config.
- Current routes are flat under `apps/mobile/app`: index, onboarding, auth,
  home, discovery/course/caddie routes, golfer booking/payment routes, profile
  and settings, plus `caddie-dashboard`. The only dynamic paths use `[id]`.
- The root layout owns one `Stack`, font loading, `SafeAreaProvider`, and
  `AppSessionProvider`. There are no nested layouts, tab navigators, or
  role-specific real URL path segments.
- Route files are thin adapters to screen implementations in `src/features`.
  Navigation strings are currently flat (for example `/home`, `/courses`,
  `/caddies`, `/booking`, `/payment`, and `/caddie-dashboard`).

### Authentication, role, and verification findings

- `src/features/session/AppSession.tsx` is a local mock session provider.
  It restores only `nobogey.initial-role` from AsyncStorage, then sets
  `activeRole` to that device-selected value.
- It has no authenticated user identity, access token, API-backed session
  restoration, explicit signed-out state, or logout function. The settings UI
  presents a logout row but it is not connected to a session operation.
- `AppRole` is a local `"golfer" | "caddie"` union. `golferSignedIn` is a
  local boolean set only when `signInAs("golfer")` runs.
- `CaddieVerificationState` is local, and the provider creates it as the fixed
  value `"pending"`; it is not fetched, restored, or derived from a profile.
- `backend/users/users.types.ts` declares a placeholder `UserProfile` with a
  `role`, but it is not currently returned by an implemented client flow.
- `backend/auth/auth.types.ts` declares `AuthSession` with user ID, access
  token, and expiry only. It contains neither role nor verification status.
- All mobile backend services, including `getSession`, `getUserProfile`, and
  authentication operations, are documented placeholders and throw
  `Not implemented`. They are outside this frontend-only task boundary.
- Therefore the current repository cannot distinguish an authenticated golfer,
  authenticated caddie, unknown role, or invalid verification status from a
  real session. A device-selected role must not be used as a privileged access
  decision.

### Shared domains and styling

- Mock bookings, courses, caddies, and availability are centralized in
  `src/data/mock.ts`; screen implementations are otherwise feature based.
- Placeholder API domain modules live under `apps/mobile/backend`; they were
  inspected only and will not be edited in this frontend-only refactor.
- `packages/ui/src/index.ts` already supplies a raw palette, semantic colors,
  spacing, radii, typography, line heights, fonts, border widths, and elevation.
  It is shared at monorepo level, so it must not be changed without explicit
  approval under the task boundary.
- The app uses `@nobogey/ui` alongside many raw style literals. The following
  files contain hexadecimal or RGB(A) literals and would form the planned color
  migration inventory: account entry, booking, caddie, course, discovery,
  home, profile, and settings feature screens, caddie detail UI, marketplace
  cards, and `src/ui/booking-design.tsx`.

### Tooling and verification availability

- Mobile commands from `apps/mobile/package.json`:
  - `pnpm --filter @nobogey/mobile lint`
  - `pnpm --filter @nobogey/mobile typecheck`
  - `pnpm --filter @nobogey/mobile test`
  - `pnpm --filter @nobogey/mobile build` (web export)
- Equivalent root commands use Turbo: `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and `pnpm build`.
- No formatter check command is configured.

## Proposed migration, pending required contract

When the authentic session/profile contract is available, perform no more than
four bounded cycles:

1. Establish root and role-specific layouts using real `golfer/` and
   `caddie/` URL segments, preserving existing screen behavior and converting
   dynamic parameters to descriptive names.
2. Consume the single real session/profile source in layout-level guards only
   after hydration. Redirect signed-out, wrong-role, unknown-role, and
   invalid-verification states safely; client guards remain navigation UX, not
   backend authorization.
3. Introduce a mobile-local theme facade if needed without changing the shared
   package, then migrate shared/auth/navigation colors before feature batches.
4. Move affected navigation references, run checks, update `AGENTS.md` with
   implemented conventions, and hand off for manual validation.

## Required backend/session clarification

No backend change is requested or made here. Before frontend implementation can
proceed, provide an existing, consumable session or profile response that is
available after session restoration and includes:

- authenticated/signed-out state and stable user ID;
- a safely typed role (`golfer` or `caddie`), with a defined unknown/invalid
  case; and
- for caddies, a verification status and its allowed values, including the
  expected route or UI behavior for pending, rejected, and invalid values.

Alternatively, explicitly authorize the app to remain a mock-only prototype
and specify that its persisted role and fixed verification state are acceptable
for navigation demonstrations. Without one of these decisions, implementation
would invent production assumptions.

## Cycles, commands, and corrections

### Cycle 1 — route-tree separation

- Scope: separate existing thin route adapters into public, auth, golfer, and
  caddie layout trees with real role URL segments; do not add role guards.
- Expected files: `apps/mobile/app/**`, route navigation callers under
  `apps/mobile/src/features`, and this state document.
- Intended behavior: preserve existing screen implementations while changing
  routes to `/golfer/...`, `/caddie/...`, `/onboarding`, and `/sign-in`.
- Risks: stale navigation strings, incorrect relative adapter imports, nested
  header duplication, and accidental behavior changes in mock flows.
- Checks: mobile lint, typecheck, tests, web export when practical, route and
  stale-navigation searches, and diff review.
- AGENTS.md impact: deferred until the route tree and checks stabilize.
- Changes made: added public/auth/app nested layouts, golfer and caddie stack
  layouts, moved all existing route adapters into their appropriate trees, and
  converted dynamic segments to `[courseId]`, `[caddieId]`, and `[bookingId]`.
  Updated the corresponding feature navigation calls and local-search-param
  names.
- Correction: an over-broad edit briefly removed the existing rating input and
  submit UI from `RateCaddieScreen`; it was restored immediately, retaining
  only its route-path change.
- Correction: removed the unused `setRole` binding already present in the
  moved authentication screen so the changed frontend files lint cleanly.
- Remaining concern: no caddie-owned profile, availability editor, or booking
  detail screen exists in the current UI. The caddie dashboard's pre-existing
  profile and availability links therefore continue to open the golfer profile
  route as a documented legacy behavior; creating caddie account screens would
  require product/UI scope beyond this route-only cycle.

Inspection commands run: repository/AGENTS discovery, git status, package and
configuration reads, route/session/API source inspection, navigation and
color-literal inventories, installed-version reads, and post-change route and
stale-navigation searches.

### Cycle 1 verification results

- `apps/mobile/node_modules/.bin/tsc -p apps/mobile/tsconfig.json --noEmit`:
  passed.
- `../../node_modules/.bin/eslint app src` from `apps/mobile`: passed.
- `../../node_modules/.bin/vitest run --passWithNoTests` from `apps/mobile`:
  passed; no test files exist.
- `apps/mobile/node_modules/.bin/expo export --platform web`: passed and
  emitted the new `/golfer/...`, `/caddie/dashboard`, `/sign-in`, and
  `/onboarding` routes. No route-collision error was reported.
- `git diff --check`: passed.
- Full `pnpm --filter @nobogey/mobile lint` did not complete in this execution
  environment. The equivalent direct full-app ESLint run completed and failed
  only on pre-existing unused arguments in untouched placeholder
  `apps/mobile/backend/**` services and undeclared Node globals in the untouched
  database test script. No changed `app` or `src` file failed lint.
- The `pnpm --filter @nobogey/mobile test` wrapper also stalled without output;
  the direct Vitest command above completed successfully.
- The old flat navigation-path search returned no matches after the route move.

`AGENTS.md` was updated after the route tree stabilized. It preserves the
existing repository guidance and adds actual routing, mock-session, theme, and
verification rules. Its documented paths and commands were checked against the
repository; it intentionally does not claim the unavailable role guard or
theme migration has been implemented.

## Human handoff and remaining concerns

Human confirmation is required for the actual source of role and caddie
verification data before client-side role protection or verification routing can
begin. Once supplied, validate that the contract is available during session
restoration and that its unknown cases are explicit. Then resume with guarded
routing, theme migration, and the full manual routing, authentication,
payment-handoff, and visual checklist.
