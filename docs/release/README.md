# NoBogey Mobile Release Phases

This document tracks the frontend work planned before the NoBogey Android app is considered for Play Store testing. It is a working checklist, not proof that a phase is complete.

The current cycle intentionally keeps all six phases uncommitted until the final review. Every new phase must therefore preserve the existing working tree and stop for manual approval.

## Scope and Boundaries

This cycle covers:

- A controlled mock-data experience in the real Expo mobile app.
- Golfer and caddie mobile UI refinement.
- An in-place caddie match sheet.
- Shared role-aware Settings behavior.
- Admin-web refinement and audit-log removal.
- Compatible mobile and web domain contracts.
- Android release-readiness review.

This cycle does not cover:

- Production backend implementation.
- Live mobile/web synchronization.
- Production authentication or authorization.
- Real payment collection or payout processing.
- App-store submission without separate approval.
- Staging, committing, pushing, or opening a pull request before the final six-phase review.

`AppSession`, AsyncStorage, local fixtures, and the admin portal's localStorage state remain prototype mechanisms. They must not be described as production identity, persistence, club verification, or security.

## Status Legend

- **Implemented** — supporting code is present.
- **Complete** — implementation, automated checks, and required manual evidence satisfy the phase exit gate.
- **Needs closure** — implementation exists, but validation or consistency issues remain.
- **Not started** — the planned behavior is not present in the current checkout.
- **Blocked** — work cannot safely continue without a decision or external requirement.

## Current Snapshot

Snapshot date: August 16, 2026

Current branch: `add/terms-&-conditions`

All phases have now received an implementation pass. This does not yet make the cycle release-ready: the latest verification found compilation, lint, mock-workflow, mobile-build, manual-QA, and Android package-identity gaps. Nothing is marked complete until its exit gate is supported by evidence.

| Phase | Status | Current evidence | Exit requirement |
| --- | --- | --- | --- |
| 0 — Stabilize current work | Needs closure | Branch, status, diff statistics, and unstaged state were rechecked; all cycle work remains uncommitted | Classify the mixed worktree and lockfile/workflow changes, then complete the combined-diff review |
| 1 — Main-mobile controlled mock data | Needs closure | A typed `mobileDataService` seam and empty/error UI states exist | Restore the required controlled golfer/caddie mock scenario; the current service returns no records |
| 2 — Caddie match popup and refinements | Needs closure | Match and round sheets plus responsive mobile UI are present | Resolve match-sheet/dashboard TypeScript and lint errors and record manual popup QA |
| 3 — Shared role-aware Settings | Needs closure | Shared Settings, Terms, local sheets, and direct logout behavior are present | Resolve Settings/Terms TypeScript errors and record golfer/caddie manual QA |
| 4 — Admin-web refinement and audit removal | Needs closure | Audit UI/state removal, responsive styling, safer assignment controls, and the verification queue UI are present | Fix adapter typing, provide an exercisable local review scenario or revise acceptance criteria, and complete browser/operations QA |
| 5 — Mobile/web contract compatibility | Needs closure | Shared status, money, ID, and timestamp vocabulary plus admin mapper tests and boundary documentation are implemented | Make both applications typecheck and verify equivalent records through both app seams |
| 6 — Android release-readiness audit | Needs closure | CI and EAS workflows, owner/project identity, remote versioning, preview APK, and production build profiles are configured | Replace the placeholder package ID, close legal/store-material gaps, finish validation/manual QA, and produce the readiness decision |

## Phase 0–3 Closure Pass

Run this closure pass before starting Phase 4.

### 1. Preserve the Working Tree

- [x] Record `git status --short --branch`.
- [x] Record `git diff --stat` and `git diff --name-only`.
- [ ] Distinguish pre-cycle work from Phase 1–3 changes.
- [ ] Do not reset, restore, delete, broadly reformat, or switch branches.
- [x] Confirm that no files are staged or committed during the phase cycle.
- [ ] Review the large `pnpm-lock.yaml` change and confirm that every lockfile change is required.
- [ ] Decide whether the untracked GitHub and EAS workflow files belong to this six-phase cycle.

### 2. Close Phase 1

Current implementation:

- `apps/mobile/backend/mock.service.ts` exposes the typed data-service boundary.
- `apps/mobile/src/features/data/useMobileData.ts` keeps feature screens behind that boundary.
- Mobile screens now provide explicit empty states when records are unavailable.
- `apps/mobile/backend/mock.service.test.ts` verifies the current empty service contract.

Known issue:

- `apps/mobile/src/data/catalog.ts` is deleted in the current worktree.
- Every `mobileDataService` query currently returns an empty array, `null`, or an empty week.
- The controlled Manila-area golfer/caddie scenario, requested and confirmed bookings, tee-time states, and availability records required by Phase 1 are therefore absent.
- The current tests prove only the empty adapter behavior; they do not prove referential integrity or the planned user journeys.

Closure checklist:

- [ ] Restore a controlled local fixture behind `mobileDataService` without adding a production backend.
- [ ] Add tests that express the same intentional scenario as the fixture.
- [ ] Include requested and confirmed booking behavior if both remain acceptance requirements.
- [ ] Keep all course, golfer, caddie, tee-time, booking, and availability IDs valid.
- [ ] Confirm that all mock timestamps are valid and display in the Manila context.
- [ ] Confirm the golfer path from Home through upcoming bookings.
- [ ] Confirm the caddie path from sign-in through dashboard tabs.

### 3. Close Phase 2

Current implementation:

- `apps/mobile/src/features/caddie/CaddieMatchSheet.tsx` presents selected match details in a modal sheet.
- `apps/mobile/src/features/caddie/CaddieDashboardScreen.tsx` opens the sheet from roster data.
- `apps/mobile/src/features/profile/RoleProfileScreen.tsx` reuses the same sheet for recent caddie matches.

Known issues:

- A booking status is used as a dashboard style key without covering the full shared `BookingStatus` vocabulary.
- React Native's installed accessibility-role type does not accept the current `"dialog"` value in the match and golfer-round sheets.
- Dashboard, match-sheet, and bottom-navigation files retain unused symbols that fail lint.
- The empty mobile data service prevents the match flow from being exercised against the intended controlled scenario.

Closure checklist:

- [ ] Use one consistent caddie identity throughout the restored controlled scenario and dashboard.
- [ ] Derive client, course, schedule, and metric copy from the controlled scenario where practical.
- [ ] Fix the modal accessibility implementation without suppressing TypeScript.
- [ ] Verify close control, backdrop close, and Android back behavior.
- [ ] Verify missing-record behavior.
- [ ] Verify the sheet scrolls on short phones and remains capped on tablet/web.
- [ ] Verify closing the sheet preserves the selected dashboard tab.

### 4. Close Phase 3

Current implementation:

- `apps/mobile/src/features/settings/SettingsScreen.tsx` is shared by golfer and caddie routes.
- Account, preferences, payment/payout explanation, notifications, support, and Terms behaviors are represented through existing routes or local sheets.
- Logout remains immediate and routes to `/sign-in`.
- `apps/mobile/src/features/legal/TermsAcceptanceModal.tsx` supports acceptance and viewer modes.

Known issues:

- The settings section configuration currently widens an icon name to `string`, causing a TypeScript error.
- The Terms modal references a radius token that does not exist in the shared theme.
- Local preferences are prototype-only and are not synchronized to an account.

Closure checklist:

- [ ] Fix Settings configuration typing without using unsafe casts.
- [ ] Use an existing shared radius or a justified local structural value.
- [ ] Confirm every visible settings row opens a route/sheet or is visibly disabled.
- [ ] Test both golfer and caddie wording.
- [ ] Test Terms acceptance and viewer behavior.
- [ ] Test direct logout and repeated taps during logout.
- [ ] Confirm there is no silent no-op navigation.

## Current Validation Record

Run from the repository root.

### Checks run on August 16, 2026

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm typecheck` | Interrupted | Turbo produced no output for about 90 seconds; it was stopped and replaced with direct workspace checks |
| `./node_modules/.bin/tsc -p apps/mobile/tsconfig.json --noEmit` | Failed | Ten diagnostics remain across booking management, dashboard, match and round sheets, Terms, and Settings |
| `./node_modules/.bin/tsc -p apps/admin-web/tsconfig.json --noEmit` | Failed | One `exactOptionalPropertyTypes` diagnostic remains in `backend/caddie-verification.ts` |
| Direct contracts, UI, and utils typechecks | Passed | All three shared packages typecheck without emitting files |
| Direct mobile ESLint | Failed | Twenty-six errors: twenty-one unused placeholder-service arguments and five changed-UI unused symbols |
| Direct admin-web and shared-package ESLint | Passed | No diagnostics reported |
| `./node_modules/.bin/vitest run --passWithNoTests` | Passed | Five test files and thirteen tests passed |
| `../../node_modules/.bin/vite build` from `apps/admin-web` | Passed | Production web bundle built successfully; no deployment was attempted |
| Mobile Expo web export | Did not complete | Metro started twice but emitted no bundle in the observed windows; the final run was stopped after about 90 seconds |
| `git diff --check` | Passed | No whitespace errors reported |

Do not mark any phase complete until its changed-surface errors and missing acceptance evidence are closed.

Recommended validation commands:

```bash
./node_modules/.bin/tsc -p apps/mobile/tsconfig.json --noEmit
./node_modules/.bin/eslint apps/mobile/src apps/mobile/backend
./node_modules/.bin/vitest run --passWithNoTests
pnpm --filter @nobogey/mobile build
git diff --check
```

When reporting lint results, separate errors introduced by this cycle from untouched placeholder-service errors.

## Phase 4 — Admin-Web Refinement

Primary files:

- `apps/admin-web/src/App.tsx`
- `apps/admin-web/src/styles.css`
- `apps/admin-web/src/lib/fleet.ts`
- `apps/admin-web/backend/fleet.ts`

Work:

- [ ] Test login, dashboard, calendar, tee-time editing, assignments, caddie editing, and logout before changing them.
- [x] Add narrow-screen navigation, layout, modal, editor, roster, and calendar styling.
- [x] Add safer disabled behavior for unassigning an empty tee-time assignment.
- [x] Improve responsive forms, filters, dialogs, and action layouts in the stylesheet.
- [ ] Preserve the existing booking-window and assignment rules.
- [x] Remove the visible `AuditLog` section.
- [x] Remove audit export, pagination, clear controls, and audit-only styles.
- [x] Remove audit recording from `FleetState` while safely discarding legacy saved `audit` data during localStorage loading.
- [x] Remove dead audit imports and frontend code.
- [x] Keep the existing dashboard, tee-time, caddie, and assignment surfaces in `App.tsx` instead of performing a broad rewrite.
- [x] Keep the admin portal explicitly described as local mock state.
- [x] Add the `/admin/verifications` route without replacing the existing operations routes.
- [ ] Manually confirm that the responsive CSS behaves correctly at desktop, tablet, and narrow mobile widths.
- [ ] Manually confirm that all pre-existing operations still work after audit-state removal.

### Additional Phase 4 Work: Caddie Verification Queue

Phase 4 also added the presentation and contract boundary for a club-review workflow beyond the original audit-removal requirement:

- `packages/contracts/src/index.ts` now includes caddie-verification summaries, details, documents, history, statuses, filters, and typed errors.
- `apps/admin-web/backend/caddie-verification.ts` provides an unconfigured review-service adapter boundary.
- `apps/admin-web/src/lib/caddie-verification.ts` preserves a narrow frontend adapter boundary.
- `apps/admin-web/src/features/caddie-verification/CaddieVerificationQueue.tsx` provides search, status filtering, newest/oldest/name sorting, five-record pagination, refresh, detail review, approval, rejection, and request-more-information behavior.
- `/admin/verifications` is available from the admin header and footer.
- Loading, empty, retry, validation, submitting, success, and deliberate service-error states are represented in the queue.
- Two verification-adapter tests pass for the empty list and explicit `UNAVAILABLE` action boundary.

There is currently no review fixture or persistent club-review state: listing returns no records and detail/decision actions return `UNAVAILABLE`. This is not production verification, identity, authorization, document storage, or mobile/web synchronization.

Known closure issues:

- [ ] Represent or assign optional `fieldErrors` without violating `exactOptionalPropertyTypes`.
- [ ] Rerun admin typecheck after those fixes.
- [ ] Either provide a controlled local verification fixture or explicitly revise the Phase 4 acceptance criteria to an empty integration boundary.
- [ ] Manually test loading, empty, refresh, filter, search, sort, pagination, detail, approve, reject, request-more-information, validation-error, and deliberate service-error states.
- [ ] Confirm that filtering, searching, sorting, and status changes reset or preserve the current page intentionally.
- [ ] Confirm keyboard close/focus behavior and responsive dialog scrolling in a browser.
- [x] Reconcile the verification vocabulary through the shared Phase 5 contract.

### Phase 4 Validation Record

| Check | Result | Notes |
| --- | --- | --- |
| Admin typecheck | Failed | Rechecked August 16: one exact-optional-property diagnostic remains in `backend/caddie-verification.ts` |
| Admin lint | Passed | Rechecked August 16: source and adapter boundary passed direct ESLint |
| Admin unit tests | Passed | Rechecked August 16: verification and contract-mapper tests passed; four tests total |
| Admin production build | Passed | Rechecked August 16: Vite built from `apps/admin-web`; generated `dist/` remains ignored |
| Manual browser QA | Not recorded | Required before Phase 4 can be marked complete |

Exit gate:

```bash
pnpm --filter @nobogey/admin-web typecheck
pnpm --filter @nobogey/admin-web lint
pnpm --filter @nobogey/admin-web test
pnpm --filter @nobogey/admin-web build
git diff --check
```

## Phase 5 — Contract Compatibility

Primary files:

- `packages/contracts/src/index.ts`
- `apps/mobile/backend/`
- `apps/admin-web/src/lib/`
- `apps/admin-web/backend/`
- `docs/api/`

Work:

- [x] Define the canonical mobile/web domain vocabulary in `packages/contracts`.
- [x] Align course, caddie, booking, and slot identifier field names.
- [x] Align tee-time, booking, assignment, and verification statuses.
- [x] Use the shared `MoneyAmount` representation for rates and quotes.
- [x] Align ISO timestamp formats and document the Manila presentation timezone.
- [x] Add explicit admin fleet-to-contract mapping functions.
- [x] Add tests for money, identifier, verification, timestamp, and tee-time-state mappings.
- [x] Keep app-owned data seams independent.
- [x] Do not make either frontend import from the other.
- [x] Document that compatibility does not provide live persistence or synchronization.

Exit gate:

- [ ] Both apps and shared packages typecheck; shared packages pass, but mobile and admin-web still fail.
- [x] Mapping tests pass.
- [ ] Equivalent records are demonstrated through both app seams; the mobile seam currently returns no records.
- [x] The remaining production integration boundary is documented honestly.

## Phase 6 — Android Release-Readiness Audit

Primary files:

- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/package.json`
- `apps/mobile/android/`
- `apps/mobile/.eas/`
- `.github/workflows/`
- `apps/mobile/src/features/legal/`

Work:

- [ ] Replace the placeholder Android application ID before creating the Play Console application.
- [x] Record the configured Expo owner and project ID.
- [x] Configure remote app-version management with production auto-increment.
- [x] Configure preview Android builds as internal APKs and production builds with the default store artifact.
- [ ] Review icon, adaptive icon, splash, and application name.
- [ ] Review production environment requirements without exposing secrets.
- [ ] Review Terms, Privacy Policy, and account-deletion gaps.
- [ ] Prepare store description, screenshots, tester instructions, and Data Safety inputs.
- [x] Add root CI and staged/production EAS workflow definitions.
- [ ] Review CI/EAS workflow triggers, permissions, versions, and release approval behavior before tracking them.
- [ ] Run the full repository validation suite.
- [ ] Perform the final combined-diff review before any staging or commit.

### Phase 6 Audit Findings

- Android still uses `com.anonymous.nobogeymobile` in Expo configuration and the checked-in native Android project.
- `eas.json` declares Node `22.22.2`, pnpm `11.17.0`, remote versioning, an internal preview APK, and production auto-increment.
- The EAS production workflow includes a manual approval job before store submission, but no cloud build or submission was triggered during this audit.
- Root CI runs install, lint, typecheck, test, and build on `staging` and `main`; local equivalents do not yet all pass.
- A Terms experience exists, but repository evidence for a Privacy Policy, account-deletion flow, store listing, screenshots, tester instructions, and Data Safety answers was not found.
- The mobile Expo web export started Metro but did not produce a bundle in the observed verification window.

This audit must not automatically run a paid cloud build, create credentials, publish, or submit the app.

## Manual Mobile QA Matrix

Test at least one small Android phone and one wider layout. The implementation pass is user-reported complete, but no itemized manual results were provided for this snapshot, so these evidence checkboxes remain open.

### Golfer

- [ ] Signed-out startup.
- [ ] Role selection and restored role.
- [ ] Home course and caddie sections.
- [ ] Course profile and tee-time selection.
- [ ] Open, held, full, and closed tee-time states.
- [ ] Caddie selection and profile sheet.
- [ ] Booking summary and local confirmation.
- [ ] Requested and confirmed upcoming bookings.
- [ ] Profile and round-history sheet.
- [ ] Settings, Terms, back navigation, and logout.

### Caddie

- [ ] Sign-in and local verification behavior.
- [ ] Dashboard header and consistent identity.
- [ ] Schedule, roster, and portfolio tabs.
- [ ] Availability editing.
- [ ] Match-sheet contents and all close paths.
- [ ] Missing/stale match behavior.
- [ ] Profile and recent-match behavior.
- [ ] Settings, Terms, back navigation, and logout.

### Layout and Accessibility

- [ ] Safe areas are respected.
- [ ] Sheets scroll on short screens.
- [ ] No horizontal clipping.
- [ ] Icon-only controls have labels.
- [ ] Selected, pressed, disabled, loading, and error states are visible.
- [ ] Text remains readable with increased font size.
- [ ] Existing raised golf-ball navigation remains unchanged.

## Prompt Template for the Next Phase

```text
Use the repository AGENTS.md instructions.

CURRENT PHASE:
Final closure pass — all phases have implementation work but none currently
satisfies every exit gate

Read docs/release/README.md before editing. The working tree contains
intentional uncommitted changes from the complete phase cycle. Treat them as the
protected baseline.

Work through the recorded blockers in dependency order: restore the controlled
mobile scenario, close mobile TypeScript/lint issues, close the admin adapter
type error and exercisable verification criteria, validate both applications,
then finish the Android identity/legal/store-readiness audit.

Do not modify supabase/, stage, commit, push, switch branches, trigger EAS, or
submit to a store. Do not broaden the local fixtures into production
identity, authorization, persistence, or document storage.

Preserve unrelated work. Run the direct workspace checks before relying on the
Turbo wrappers, complete the manual QA matrices, and finish with the handoff
format from this README. Stop for approval before any first commit.
```

## Per-Phase Handoff

Every phase should finish with:

1. **Outcome** — what now works.
2. **Changed files** — paths changed during this phase only.
3. **Earlier work preserved** — pre-existing and earlier-phase files left intact.
4. **Validation** — exact commands and results.
5. **Manual QA** — completed and remaining checks.
6. **Prototype boundaries** — what remains local, mock, unauthenticated, or unsynchronized.
7. **Git state** — confirmation that nothing was staged, committed, pushed, published, or submitted.
8. **Next gate** — the next phase, without starting it.

## Final Review Before the First Commit

After Phase 6:

- [ ] Review the complete six-phase diff without editing it.
- [ ] Group changed files by phase.
- [ ] Identify accidental, generated, or unrelated changes.
- [ ] Review dependency and lockfile changes separately.
- [x] Run mobile, admin-web, shared-package, and root checks; failures are recorded above.
- [ ] Complete the manual golfer and caddie flow checklists.
- [x] Record all remaining release blockers.
- [x] Classify the current result as an internal-test prototype, not a public-release candidate.
- [ ] Propose a scoped commit breakdown.
- [ ] Wait for explicit approval before staging or committing.

Without production persistence, authentication, verification, payments, and shared synchronization, the current application should be treated as an internal-test prototype rather than a complete public marketplace release.
