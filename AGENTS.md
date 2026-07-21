# neo-nidhi — AI Agent Guide

**neo-nidhi** is a family finance management web/mobile app (Next.js + MongoDB) with savings, fixed/recurring deposits, loans, challenges, asset tracking, and QR code transfers. Deployed on Vercel; packaged as a PWA and native Android app via Capacitor/TWA.

## Essential Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build (uses --webpack flag, see package.json)
pnpm test             # Run all tests (Vitest)
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage
pnpm lint             # ESLint
pnpm format           # Prettier write
pnpm seed             # Seed database (preserves users)
pnpm seed:reset       # Seed database (clears users)
```

## Required Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string — **required**, app crashes without it |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `NEXTAUTH_URL` | App base URL for NextAuth callbacks |
| `METALS_API_KEY` | Commodities/metals price API (optional) |
| `NEXT_PUBLIC_ANDROID_APK_*` | Android install page content (optional) |
| `NEXT_PUBLIC_CONTENT_VARIANT` | Content variant: `default` or `pro` (optional) |

No `.env.example` exists — infer required vars from the table above.

## Project Structure

```
src/
├── app/            # Next.js App Router pages + API routes
│   ├── api/        # REST endpoints (see patterns below)
│   ├── admin/      # Admin dashboard pages
│   └── user/       # User pages
├── models/         # Mongoose schemas (source of truth for data shapes)
├── lib/            # Utilities, services, DB, auth, calculations
│   ├── services.ts # Service layer entry point + ServiceLocator
│   └── services/   # Individual service classes (SOLID pattern)
├── hooks/          # Custom React hooks (data fetching + state)
├── components/     # React components (mostly 'use client')
├── jobs/           # Background cron jobs
├── types/          # TypeScript types and DTOs
├── constants/      # Static data
└── content/        # Content variants (content.json / contentPro.json)
```

TypeScript path alias: `@/` resolves to `src/`.

## Architecture Decisions

### Auth
- NextAuth 4 with `CredentialsProvider` — login by **name + password** (not email)
- Session includes `user.id` and `user.role` via JWT callbacks
- All API routes validate session with `getServerSession(authOptions)`
- Role hierarchy: `admin` > `privileged` > `user`
- Authorization helpers: `requireAdminLikeAccess()`, `canManageUser()` in [`src/lib/adminAccess.ts`](src/lib/adminAccess.ts)
- Separate MPIN system for transaction confirmation (`MPINService`, `/api/users/[id]/verify-mpin`)

### Database
- MongoDB via Mongoose; connection cached as singleton in [`src/lib/dbConnect.ts`](src/lib/dbConnect.ts) — always call `await dbConnect()` at the top of API routes
- Models: `User`, `Transaction`, `Scheme`, `Challenge`, `ChallengeParticipant`, `QuizQuestion`, `QuizResult`, `Budget`, `CashFlow`, `Settings`
- `User` embeds `assetPortfolio[]`, `liabilities[]`, `recurringDeposits[]` (denormalized)
- `Transaction` is an append-only ledger — never update or delete records

### API Routes
- All routes under `src/app/api/`
- Admin routes under `/api/admin/*` — always guard with `requireAdminLikeAccess()`
- Cron triggers as HTTP GETs: `/api/run-interest`, `/api/run-rd-debits`, `/api/run-asset-revaluation`
- Feature flags enforced at API level via `enforceFinanceFeatureEnabled()` from [`src/lib/featureFlags.ts`](src/lib/featureFlags.ts)

### Service Layer
- Business logic lives in `src/lib/services/` (SOLID principles) — see [`SOLID_REFACTORING.md`](SOLID_REFACTORING.md)
- Services are injected via `useServices()` hook in components, never called directly
- Always add new business logic to a service class, not inline in components or API routes

### React / Components
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — avoid manual `useMemo`/`useCallback` unless justified
- Interactive components must be `'use client'`; prefer keeping pages as server components
- Custom hooks (`src/hooks/`) handle all data fetching and loading/error state
- `AppProviders.tsx` wraps the app with session and other context providers

### Testing
- **Vitest** with `jsdom` environment; globals enabled — no `import { describe, it }` needed
- Setup file: [`src/setupTests.ts`](src/setupTests.ts) — stubs `fetch` for relative/localhost URLs to return `{}` by default; tests that need specific responses must stub `fetch` explicitly with `vi.fn()`
- Tests are co-located: `ComponentName.test.tsx` beside `ComponentName.tsx`
- Mock modules with `vi.mock()`, mock functions with `vi.fn()`
- Run a single test file: `pnpm test src/path/to/file.test.tsx`

## Pitfalls & Non-Obvious Patterns

- **Build flag**: `next build` is invoked with `--webpack`; do not remove this flag
- **Login is by name, not email** — the auth credentials field is `name`, not `email`
- **User model backward-compat**: both `features.financeFeaturesEnabled` (new) and `financeFeaturesEnabled` (old, top-level) exist on User docs — check both for access control
- **Interest fields are per-product**: `accruedSavingInterest`, `accruedFdInterest`, `accruedRdInterest`, `accruedLoanInterest` — not a single field
- **Content variants**: UI text is loaded from `src/content/` based on `NEXT_PUBLIC_CONTENT_VARIANT` env var via [`src/content/index.ts`](src/content/index.ts)
- **No `.env.example`**: environment vars must be inferred from code; see table above

## Key Reference Docs

- [Android setup](docs/android-native-capacitor.md)
- [SMS auto-finance](docs/android-sms-auto-finance.md)
- [RD maturity transfer plan](docs/rd-maturity-transfer-plan.md)
- [Reports feature](REPORTS_FEATURE.md)
- [SOLID refactoring guide](SOLID_REFACTORING.md)
