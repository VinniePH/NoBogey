# NoBogey Modular Monorepo Foundation Design

## Purpose

NoBogey is an on-demand golf caddie booking product. The first rebuild should establish a clean modular monorepo that prioritizes the Expo React mobile app while documenting how future backend and admin surfaces will fit into the system.

This phase is a project setup foundation, not the full booking product implementation.

## Source Context

The current product brief describes:

- Golfers finding and booking caddies ahead of time.
- Caddies managing availability, client history, earnings, performance, and portfolios.
- Core pain points around caddie availability, schedule conflicts, weak profile data, clubhouse whiteboard booking, and lack of digital tracking.
- Future support for cashless payment, with GCash named as the intended payment integration.

## Approved Direction

Use a mobile-first monorepo with documented backend boundaries.

The first real product surface is `apps/mobile`, built with Expo and React. The repository should also include a lightweight `apps/admin-web` placeholder for future operations tooling. Backend framework selection remains intentionally undecided; the backend is represented through contracts and documentation until mobile requirements are clearer.

## Repository Shape

```text
apps/
  mobile/
    Expo React app and first active product surface.
  admin-web/
    Thin Vite React placeholder for future operations and admin workflows.

packages/
  contracts/
    Shared domain types and API-facing schemas.
  config/
    Shared TypeScript, lint, formatting, and task configuration.
  ui/
    Reusable UI primitives, mobile-safe first.
  utils/
    Shared helper functions for formatting, validation glue, and app-neutral logic.

docs/
  architecture/
    Monorepo structure, product architecture, and data flow notes.
  api/
    Backend boundary, route groups, entity lifecycle, auth notes, and payment notes.
  superpowers/specs/
    Approved design specs and planning artifacts.
```

## App Responsibilities

### `apps/mobile`

The mobile app is the main target for the first implementation pass. It should be runnable and structured for the expected MVP flows:

- Home surface for nearby golf courses and recent or preferred caddies.
- Find-game or course-selection flow.
- Caddie listing and caddie profile surfaces.
- Booking placeholder flow.
- Golfer profile and history placeholder.
- Caddie dashboard placeholder for availability, roster, earnings, feedback, and portfolio.

The initial mobile screens can use local mock data, but that mock data should conform to shared contracts.

### `apps/admin-web`

The admin web app should be a runnable Vite React placeholder only. It exists to reserve a clear home for future operations workflows such as:

- Caddie approval or verification.
- Booking review and support.
- Golf course management.
- Payment or dispute support.

It should not become a feature priority during the mobile foundation phase.

## Shared Package Responsibilities

### `packages/contracts`

This is the main backend/frontend boundary until a backend framework is chosen. It should define shared domain language and API-facing data shapes for:

- `Golfer`
- `Caddie`
- `GolfCourse`
- `AvailabilitySlot`
- `Booking`
- `Review`
- `PaymentIntent`

Contracts should be easy for the mobile app to import and easy for a future backend to implement. They should avoid framework-specific dependencies. Start with plain TypeScript interfaces and union types; add runtime schemas later only when request validation or API serialization needs them.

### `packages/config`

This package centralizes shared configuration for TypeScript, linting, formatting, and workspace conventions so each app does not drift.

### `packages/ui`

This package holds reusable primitives when reuse is real. It should begin small and favor mobile-safe components. Larger design-system work should wait until the mobile app proves which components repeat.

### `packages/utils`

This package holds app-neutral utilities, such as date formatting, money formatting, and simple domain helpers. It should not become a dumping ground for app-specific behavior.

## Backend Boundary

The backend runtime is not selected in this foundation phase. Do not commit to NestJS, FastAPI, Supabase Edge Functions, or another runtime yet.

Instead, document the backend through `docs/api/`:

- Auth and session expectations.
- Route groups for golfers, caddies, courses, availability, bookings, reviews, and payments.
- Booking lifecycle states.
- Payment lifecycle states, including future GCash integration points.
- Data ownership rules between mobile, admin, and backend.
- Expected error responses and permission boundaries.

The future backend should implement the documented boundary and consume or mirror `packages/contracts`.

## Data Flow

During the foundation phase:

1. `apps/mobile` renders screens with local mock data.
2. Mock data imports domain types from `packages/contracts`.
3. Mobile UI code depends on contracts and utilities, not backend internals.
4. `docs/api/` defines the expected API surface for the future backend.
5. `apps/admin-web` remains a thin placeholder that can also import shared contracts when useful.

Later, the backend will replace mobile mock data through a typed API client without changing core domain language.

## Error Handling Expectations

The foundation should define patterns for:

- Loading states.
- Empty states.
- Typed API error shapes.
- Mock-data fallback behavior.
- Permission-denied handling.
- Booking conflict handling.
- Payment failure handling.

The API docs should explicitly name common failure cases:

- Selected caddie is no longer available.
- Selected time slot is invalid or already booked.
- Booking is canceled.
- Payment fails or is abandoned.
- User lacks permission for the requested operation.

## Tooling

Use a workspace setup that supports modular development from a clean clone:

- `pnpm` workspaces.
- A task runner such as Turborepo.
- Shared TypeScript configuration.
- Shared lint and formatting configuration.
- Root-level scripts for common checks.

Required root commands:

- `pnpm install`
- `pnpm dev:mobile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Implementation should wire these commands from the root so contributors do not need to know each package's internal command names.

## Implementation Defaults

Use these defaults for the first implementation plan:

- `apps/mobile` uses Expo with TypeScript and Expo Router.
- `apps/admin-web` uses Vite React with TypeScript as a lightweight placeholder.
- `packages/contracts` starts with plain TypeScript types, not runtime schemas.
- The first mobile shell uses a simple role switch placeholder instead of real authentication.
- Shared configuration should be minimal and strict enough to catch type drift without creating heavy custom tooling.

## Verification Criteria

The setup foundation is complete when:

- Dependencies install from a clean clone.
- `apps/mobile` starts as an Expo React app.
- Shared package imports work from the mobile app.
- Type checking passes across the workspace.
- Linting runs from the root.
- Any scaffolded admin placeholder can typecheck or build.
- Documentation explains how the future backend and frontend surfaces will work together.

## Out Of Scope

This foundation phase does not include:

- Real booking persistence.
- Real authentication.
- Real payment processing.
- GCash integration implementation.
- Production backend runtime selection.
- Full admin workflows.
- Complete design system implementation.
