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
cp apps/mobile/.env.example apps/mobile/.env
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

Supabase email/password Auth is live in the mobile app and the `(app)` route group requires an authenticated session. Domain data is still mocked while database schemas, RLS policies, booking persistence, and payments remain deferred. See `docs/api/backend-boundary.md` for those boundaries.
