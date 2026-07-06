# NoBogey Monorepo Architecture

NoBogey is organized as a mobile-first TypeScript monorepo. The first active product surface is `apps/mobile`, an Expo React app that renders the initial golfer and caddie flows from local mock data.

## Workspace Shape

- `apps/mobile`: Expo Router app for the first product surface.
- `apps/admin-web`: Lightweight Vite React placeholder for future operations work.
- `packages/contracts`: Shared domain and API-facing TypeScript types.
- `packages/config`: Shared TypeScript configuration.
- `packages/ui`: Mobile-safe design tokens and future reusable primitives.
- `packages/utils`: App-neutral helpers for formatting and domain checks.

## Dependency Direction

Apps can import shared packages. Shared packages cannot import app code. `packages/contracts` stays framework-neutral so a future backend can implement or mirror the same domain language.

## Backend Deferral

The backend runtime is intentionally undecided in this foundation phase. Mobile uses local mock data shaped by contracts, while `docs/api/backend-boundary.md` records the route groups, lifecycle states, permissions, and payment expectations the backend must satisfy later.

## Root Commands

- `pnpm install`: install all workspace dependencies.
- `pnpm dev:mobile`: start Expo for the mobile app.
- `pnpm dev:admin`: start the admin placeholder.
- `pnpm lint`: run ESLint across the workspace.
- `pnpm typecheck`: run TypeScript checks through Turborepo.
- `pnpm test`: run workspace tests.
