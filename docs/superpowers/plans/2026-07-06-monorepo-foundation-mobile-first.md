# Mobile-First Monorepo Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first NoBogey monorepo foundation with `apps/mobile` as the primary Expo React surface, a thin `apps/admin-web` placeholder, shared TypeScript packages, and backend-boundary documentation.

**Architecture:** The root is a `pnpm` + Turborepo workspace. Mobile imports mock data typed by `packages/contracts` and shared helpers from `packages/utils`, while backend runtime selection stays deferred to docs and contracts. Admin web is intentionally minimal so it reserves the future operations surface without competing with mobile work.

**Tech Stack:** pnpm workspaces, Turborepo, TypeScript, Expo, Expo Router, React Native, Vite React, ESLint flat config, Vitest.

---

## File Structure

- Modify: `.gitignore` to ignore local machine, dependency, build, Expo, and worktree artifacts.
- Modify: `package.json` to define root workspace scripts and shared dev dependencies.
- Modify: `pnpm-workspace.yaml` to include `apps/*` and `packages/*`.
- Modify: `turbo.json` to use current Turborepo `tasks` syntax.
- Create: `eslint.config.mjs` as the workspace lint entrypoint.
- Create: `tsconfig.json` as the root TypeScript project-reference entrypoint.
- Create: `apps/mobile/*` as the Expo Router app.
- Create: `apps/admin-web/*` as the Vite React placeholder.
- Create: `packages/contracts/*` for framework-neutral domain and API contracts.
- Create: `packages/config/*` for shared TypeScript config.
- Create: `packages/ui/*` for mobile-safe design tokens.
- Create: `packages/utils/*` for app-neutral formatting and domain helpers.
- Create: `docs/architecture/monorepo.md` and `docs/api/backend-boundary.md` for the deferred backend contract.
- Remove from git index by replacement: the old `apps/dashboard-web` staged scaffold is superseded by `apps/admin-web`.

## Task 1: Root Workspace Tooling

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `turbo.json`
- Create: `eslint.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Replace `.gitignore`**

```gitignore
.DS_Store
.idea/
.superpowers/
.worktrees/
.pnpm-store/
node_modules/
.turbo/
dist/
build/
coverage/
.expo/
.expo-shared/
web-build/
*.log
*.tsbuildinfo
```

- [ ] **Step 2: Write the root package manifest**

```json
{
  "name": "nobogey",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.10.0",
  "scripts": {
    "dev:mobile": "pnpm --filter @nobogey/mobile dev",
    "dev:admin": "pnpm --filter @nobogey/admin-web dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "@eslint/js": "latest",
    "eslint": "latest",
    "eslint-plugin-react-hooks": "latest",
    "turbo": "latest",
    "typescript": "latest",
    "typescript-eslint": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 3: Define workspaces**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Replace Turborepo config**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "web-build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 5: Add root ESLint flat config**

```js
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.expo/**",
      "**/web-build/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  },
  {
    files: ["**/*.{tsx}"],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: reactHooks.configs.recommended.rules
  }
];
```

- [ ] **Step 6: Add root TypeScript references**

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/ui" },
    { "path": "./packages/utils" },
    { "path": "./apps/admin-web" },
    { "path": "./apps/mobile" }
  ]
}
```

- [ ] **Step 7: Run dependency install**

Run: `pnpm install`

Expected: dependency resolution completes and creates `pnpm-lock.yaml`.

## Task 2: Shared TypeScript Contracts, Config, UI, and Utils

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/typescript/base.json`
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/utils/package.json`
- Create: `packages/utils/tsconfig.json`
- Create: `packages/utils/src/format.test.ts`
- Create: `packages/utils/src/format.ts`
- Create: `packages/utils/src/index.ts`

- [ ] **Step 1: Add shared TypeScript config package**

```json
{
  "name": "@nobogey/config",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./typescript/base": "./typescript/base.json"
  }
}
```

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 2: Write the failing utils test first**

```ts
import { describe, expect, it } from "vitest";
import { formatMoney, formatTeeTime, isBookingTerminal } from "./format";

describe("formatMoney", () => {
  it("formats Philippine peso amounts without centavos by default", () => {
    expect(formatMoney(240000)).toBe("PHP 2,400");
  });
});

describe("formatTeeTime", () => {
  it("formats ISO tee times for compact mobile display", () => {
    expect(formatTeeTime("2026-07-08T06:30:00+08:00")).toBe("Jul 8, 6:30 AM");
  });
});

describe("isBookingTerminal", () => {
  it("returns true only for booking states that cannot continue", () => {
    expect(isBookingTerminal("completed")).toBe(true);
    expect(isBookingTerminal("canceled")).toBe(true);
    expect(isBookingTerminal("requested")).toBe(false);
  });
});
```

- [ ] **Step 3: Run the utils test to verify RED**

Run: `pnpm --filter @nobogey/utils test`

Expected: FAIL because `./format` does not exist yet.

- [ ] **Step 4: Add contracts package**

Create domain contracts for `Golfer`, `Caddie`, `GolfCourse`, `AvailabilitySlot`, `Booking`, `Review`, `PaymentIntent`, lifecycle unions, and `ApiError`.

- [ ] **Step 5: Add UI tokens package**

Export `colors`, `spacing`, `radius`, and `typography` constants only. Do not add a component library yet.

- [ ] **Step 6: Implement utils to satisfy the RED test**

Implement `formatMoney`, `formatTeeTime`, and `isBookingTerminal` in `packages/utils/src/format.ts`, then re-export them from `packages/utils/src/index.ts`.

- [ ] **Step 7: Run utils test to verify GREEN**

Run: `pnpm --filter @nobogey/utils test`

Expected: PASS.

- [ ] **Step 8: Typecheck shared packages**

Run: `pnpm --filter @nobogey/contracts typecheck`

Expected: PASS.

Run: `pnpm --filter @nobogey/ui typecheck`

Expected: PASS.

Run: `pnpm --filter @nobogey/utils typecheck`

Expected: PASS.

## Task 3: Expo Mobile App Shell

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/app/courses.tsx`
- Create: `apps/mobile/app/caddies.tsx`
- Create: `apps/mobile/app/caddies/[id].tsx`
- Create: `apps/mobile/app/booking.tsx`
- Create: `apps/mobile/app/profile.tsx`
- Create: `apps/mobile/app/caddie-dashboard.tsx`
- Create: `apps/mobile/src/data/mock.ts`
- Create: `apps/mobile/src/features/home/HomeScreen.tsx`
- Create: `apps/mobile/src/features/courses/CourseSelectionScreen.tsx`
- Create: `apps/mobile/src/features/caddies/CaddieListingScreen.tsx`
- Create: `apps/mobile/src/features/caddies/CaddieProfileScreen.tsx`
- Create: `apps/mobile/src/features/booking/BookingPlaceholderScreen.tsx`
- Create: `apps/mobile/src/features/profile/GolferProfileScreen.tsx`
- Create: `apps/mobile/src/features/caddie/CaddieDashboardScreen.tsx`
- Create: `apps/mobile/src/ui/Screen.tsx`

- [ ] **Step 1: Add Expo package manifest**

Use Expo Router as the entrypoint and import workspace packages with `workspace:*`. Include `react-dom` and `react-native-web` so `expo export --platform web` can compile the app graph during non-interactive verification.

- [ ] **Step 2: Add Expo Router config files**

Use `main: "expo-router/entry"`, `babel-preset-expo`, and `expo/metro-config`.

- [ ] **Step 3: Add typed mock data**

Create mock courses, caddies, golfer profile, availability slots, bookings, reviews, and payment intent states. Import all data types from `@nobogey/contracts`.

- [ ] **Step 4: Add shared mobile screen frame**

Create `Screen.tsx` with a `SafeAreaView`, scroll behavior, and reusable title/subtitle slots.

- [ ] **Step 5: Add Expo Router screens**

Wire the first mobile flow: home, courses, caddie list, caddie profile, booking placeholder, golfer profile, and caddie dashboard placeholder.

- [ ] **Step 6: Typecheck mobile app**

Run: `pnpm --filter @nobogey/mobile typecheck`

Expected: PASS.

## Task 4: Admin Web Placeholder

**Files:**
- Create: `apps/admin-web/package.json`
- Create: `apps/admin-web/index.html`
- Create: `apps/admin-web/tsconfig.json`
- Create: `apps/admin-web/vite.config.ts`
- Create: `apps/admin-web/src/main.tsx`
- Create: `apps/admin-web/src/App.tsx`
- Create: `apps/admin-web/src/styles.css`

- [ ] **Step 1: Add Vite React package manifest**

Use `@vitejs/plugin-react`, `vite`, `react`, `react-dom`, TypeScript, and workspace contracts.

- [ ] **Step 2: Create admin placeholder UI**

Show reserved operations areas for caddie approval, booking support, course management, and payment/dispute support. Keep it visibly secondary to mobile.

- [ ] **Step 3: Typecheck and build admin app**

Run: `pnpm --filter @nobogey/admin-web typecheck`

Expected: PASS.

Run: `pnpm --filter @nobogey/admin-web build`

Expected: PASS and creates `apps/admin-web/dist`.

## Task 5: Backend Boundary and Architecture Docs

**Files:**
- Create: `docs/architecture/monorepo.md`
- Create: `docs/api/backend-boundary.md`
- Modify: `README.md`

- [ ] **Step 1: Document monorepo architecture**

Describe root scripts, workspace responsibilities, mobile-first dependency direction, and why backend runtime selection remains deferred.

- [ ] **Step 2: Document API boundary**

Document auth/session expectations, route groups, entity ownership, booking lifecycle, payment lifecycle, common error responses, and future GCash integration points.

- [ ] **Step 3: Expand README quickstart**

Add install, mobile dev, admin dev, lint, typecheck, and test commands.

## Task 6: Root Verification

**Files:**
- Review all changed files.

- [ ] **Step 1: Remove obsolete staged dashboard scaffold**

Run: `git rm --cached -r apps/dashboard-web`

Expected: Git no longer tracks the old `apps/dashboard-web` staged addition.

- [ ] **Step 2: Run root lint**

Run: `pnpm lint`

Expected: PASS.

- [ ] **Step 3: Run root typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 4: Run root tests**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 5: Run mobile dev command long enough to verify startup**

Run: `pnpm dev:mobile`

Expected: Expo starts and prints the local development server URLs. Stop the process after startup is confirmed.

- [ ] **Step 6: Inspect final status**

Run: `git status --short`

Expected: New mobile-first workspace files are visible; no obsolete `apps/dashboard-web` staged entries remain.
