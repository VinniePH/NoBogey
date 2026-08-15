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

Backend implementation is intentionally deferred. See `docs/api/backend-boundary.md` for the route groups, lifecycle states, permission expectations, and future GCash payment boundary.

## Mobile Release Work

The current six-phase frontend and Android readiness cycle is tracked in [`docs/release/README.md`](docs/release/README.md). It includes the current Phase 0–3 closure gaps, remaining Phase 4–6 work, validation commands, manual QA, and the final no-commit review gate.
