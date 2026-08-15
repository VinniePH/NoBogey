# NoBogey

NoBogey is an on-demand golf caddie booking product. This repository is being rebuilt as a mobile-first TypeScript monorepo with Expo as the first active app surface.

## Apps

- `apps/mobile`: Expo React app for golfer and caddie MVP flows.
- `apps/admin-web`: Thin Vite React placeholder for future operations workflows.

## Packages

- `packages/contracts`: Shared domain and API-facing TypeScript contracts.
- `packages/config`: Shared TypeScript configuration.
- `packages/ui`: Mobile-safe design tokens.
- `packages/utils`: Shared formatting and app-neutral helpers.

## Quickstart

```bash
pnpm install
pnpm dev:mobile
```

For the full framework setup runbook, see `docs/setup/README.md`.

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Admin placeholder:

```bash
pnpm dev:admin
```

The first Supabase database foundation now lives in `supabase/migrations`; see `docs/backend/foundation.md` for its security and transaction boundaries and `docs/api/backend-boundary.md` for the planned API surface. Frontend services remain on mocks until their adapters are migrated deliberately.

## Mobile Release Work

The current six-phase frontend and Android readiness cycle is tracked in [`docs/release/README.md`](docs/release/README.md). It includes the current Phase 0–3 closure gaps, remaining Phase 4–6 work, validation commands, manual QA, and the final no-commit review gate.
