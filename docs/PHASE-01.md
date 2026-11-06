# Phase 01: Project foundation

No business modules are implemented. This phase delivers the runtime, tooling, architecture and design system the later phases build on.

## Verification status

The project was authored in a sandbox without network access, so `npm install` could not run. What was and was not verified:

| Check | Status |
| --- | --- |
| Syntax of all 71 `.ts`/`.tsx` files (TypeScript 6.0.3 parser) | Passed |
| Every relative and `@/` import resolves to a file | Passed |
| Every third-party import is declared in the matching `package.json` | Passed |
| All JSON config files parse | Passed |
| Full type-check against real dependency types | **Not run** (needs `npm install`) |
| `npm run build` (client and server) | **Not run** |
| Server tests | **Not run** |
| Server start and MongoDB connection | **Not run** (no MongoDB in the sandbox) |
| Visual check in a browser | **Not run** |

Dependency versions were chosen from memory without registry access. If `npm install` reports an unresolvable version, relax that one range and re-run.

First commands to run on your machine, in order, and what a healthy result looks like:

```bash
npm install
npm run typecheck   # no output errors in either workspace
npm test            # 10 tests pass
npm run build       # server/dist and client/dist created
npm run db:up && npm run dev
curl -i http://localhost:5000/api/v1/health/ready   # 200, "status":"ready"
```

Then stop MongoDB (`npm run db:down`) and call the same URL again: expect `503` with `error.code` `SERVICE_UNAVAILABLE`, and the client status card turning to "Degraded".

## Files

### Root
- `package.json`: npm workspaces, root scripts
- `.gitignore`: dependencies, build output, `.env*` (except `.env.example`)
- `docker-compose.yml`: local MongoDB 7, bound to 127.0.0.1, development only
- `README.md`, `docs/PHASE-01.md`

### Server (`server/`)
- `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `.env.example`
- `src/server.ts`: bootstrap, DB connect, graceful shutdown, fatal-error handlers
- `src/app.ts`: middleware pipeline and route mounting (`createApp()`, testable without listening)
- `src/config/env.ts`: Zod-validated environment, fails fast with variable names only
- `src/config/logger.ts`: Pino with redaction of auth headers, cookies, tokens, passwords
- `src/config/database.ts`: Mongoose connection layer: bounded retry, event logging, `pingDatabase()`, `getDatabaseState()`, `disconnectDatabase()`
- `src/config/version.ts`: reads the version from `package.json`
- `src/middleware/`: `requestId`, `httpLogger`, `cors`, `rateLimiter`, `validate`, `notFound`, `errorHandler` (+ `validate.test.ts`)
- `src/utils/`: `AppError` (typed error codes), `asyncHandler`, `apiResponse` (success envelope), `pagination` (query schema and meta)
- `src/modules/health/`: controller and routes
- `src/routes/index.ts`: versioned API root (`/api/v1`)
- `src/types/express.d.ts`: adds `req.requestId`
- `src/app.test.ts`: health, 404, malformed JSON, CORS, security-header tests

### Client (`client/`)
- `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` (alias `@`, `/api` dev proxy), `tailwind.config.ts`, `postcss.config.js`, `components.json` (shadcn CLI), `index.html`, `.env.example`, `public/favicon.svg`
- `src/main.tsx`, `src/App.tsx`, `src/index.css` (design tokens, light and dark)
- `src/app/`: `providers.tsx`, `router.tsx` (lazy routes), `theme.tsx` (light/dark/system)
- `src/lib/`: `env.ts` (validated config), `utils.ts`, `format.ts`, `queryClient.ts`, `api/client.ts` (typed fetch with response validation), `api/errors.ts`, `api/schemas.ts`
- `src/hooks/use-page-title.ts`
- `src/components/ui/`: button, card, input, label, badge, skeleton, separator, sheet, alert-dialog, form, sonner (shadcn/ui, hand-written to match the CLI output)
- `src/components/common/`: `ConfirmDialog`, `EmptyState`, `ErrorState`, `LoadingState`, `ErrorBoundary`, `RouteError`, `PageHeader`, `Logo`, `SkipLink`, `ThemeToggle`
- `src/components/layout/`: `AppShell`, `SidebarContent`, `Topbar`, `NavigationProgress`, `navigation.ts`
- `src/features/system/`: `useSystemStatus`, `StatusIndicator`, `SystemStatusCard`
- `src/pages/public/`: `LandingPage`, `NotFoundPage`
- `src/pages/app/`: `OverviewPage`, `SystemStatusPage`, `DesignSystemPage` (development only)

## Database changes

None. No collections, models or indexes exist yet. `autoIndex` is on outside production and off in production.

## API endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | none | Liveness: process is up. Never touches the database. |
| GET | `/api/v1/health/ready` | none | Readiness: pings MongoDB. `200` when up, `503` `SERVICE_UNAVAILABLE` when not. |

Both are exempt from rate limiting, send `Cache-Control: no-store`, and expose only version, uptime and timestamp.

## Routes (client)

`/` landing, `/app` overview, `/app/system` system status, `/app/design-system` (dev only), `*` not found. `/app` is not protected yet; the auth guard arrives with authentication.

## Security considerations

- Environment validated at boot; the process exits on bad config and never prints values. No secrets in code; `.env` files are git-ignored.
- Helmet defaults, `x-powered-by` disabled, 1 MB body limit, response compression.
- CORS allow-list from `CLIENT_ORIGIN`; other browser origins get `403`. Requests with no `Origin` header pass (curl, probes). When cookie-based refresh tokens are added, those endpoints must also rely on `SameSite` and an `Origin` check.
- Global per-IP rate limit (default 300 per 15 minutes). Set `TRUST_PROXY` to the real number of proxy hops in production or all clients share one IP. Stricter limits for login come with auth.
- `express-mongo-sanitize` strips `$`/`.` operator keys; `validate()` (Zod) is the intended gate for all input.
- Errors: one envelope, safe messages, stack traces never returned, unknown errors become a generic 500 with a `requestId` that matches the server log. Duplicate-key errors name fields, never values.
- Logging redacts `authorization`, `cookie`, `set-cookie`, and password/token fields.
- The client validates API responses with Zod, so a changed or tampered response fails loudly rather than rendering corrupt data. Client env is public by design.
- Local MongoDB in `docker-compose.yml` has no auth and is bound to localhost: development only.

## Not included yet (deliberately)

Authentication, RBAC and permissions, audit logging, Recharts (first used with dashboards), ESLint/Prettier, client tests, CI, Dockerfiles for the apps. The `AppShell`, `navigation.ts`, `routes/index.ts` and `AppError.unauthenticated/forbidden` are the intended integration points for Phase 2.
