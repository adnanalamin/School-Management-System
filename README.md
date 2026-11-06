# School Management System

React + Vite + TypeScript client and Express + TypeScript + MongoDB API in one npm-workspaces monorepo.

```
client/   React SPA (Vite, Tailwind, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod)
server/   Express API (Mongoose, Zod, Helmet, CORS, rate limiting, Pino)
docs/     Per-phase documentation
```

## Quick start

Requirements: Node.js 20.11+ and a MongoDB (the compose file below starts one locally).

```bash
npm install                                  # installs both workspaces
cp server/.env.example server/.env           # then review the values
cp client/.env.example client/.env.local
npm run db:up                                # local MongoDB via Docker (127.0.0.1:27017)
npm run dev                                  # API on :5000, client on :5173
```

Open http://localhost:5173. The status card shows live API and database health.

## Scripts (run from the repo root)

| Command | What it does |
| --- | --- |
| `npm run dev` | API (tsx watch) and client (Vite) together |
| `npm run build` | Compiles the server to `server/dist` and builds the client to `client/dist` |
| `npm run typecheck` | Strict TypeScript check of both workspaces |
| `npm test` | Server tests (Vitest + Supertest, no database needed) |
| `npm run db:up` / `db:down` | Start / stop the local MongoDB container |

Production start: `npm run build && npm run start -w server`, serving `client/dist` from a static host or reverse proxy that also forwards `/api` to the server.

## Conventions

- Secrets live only in untracked `.env` files or your host's secret store. `client/.env*` is public by nature: never put secrets there.
- Every API response uses one envelope: `{ success: true, data, meta? }` or `{ success: false, error: { code, message, details?, requestId } }`.
- Validate on the server with Zod (`validate()` middleware); client validation is a convenience only.
- Feature code goes in `server/src/modules/<feature>` and `client/src/features/<feature>`; shared UI in `client/src/components`.

See `docs/PHASE-01.md` for the full file inventory, endpoints and security notes.
"# School-Management-System" 
