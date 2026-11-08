# Phase 03: Database architecture

Backend only. No endpoints, no UI changes. The full design, collection catalogue, relationship tables and indexing strategy are in **`docs/DATABASE.md`**; this page covers what changed and how to run it.

## Verification status

Authored without network access, so MongoDB and Mongoose could not be installed or run; nothing here has touched a database.

| Check | Status |
| --- | --- |
| Syntax of all 174 files, imports resolve, no unused locals or unresolved names | Passed |
| Relationship registry matches the `ref` declarations scanned from the model sources | Passed |
| Executed for real (they do not need Mongoose): the permission catalogue (117 keys, no malformed or duplicate keys), every role's grant patterns, and all six settings schemas with their defaults and rejection rules | Passed |
| Full type-check against Mongoose's types | **Not run** |
| `npm test` (61 tests: 51 new, no database needed) | **Not run** |
| Seeding, index creation, soft-delete hooks, transactions on a real MongoDB | **Not run** |

## What was built

- **32 models** in `server/src/models/<domain>/` (the 30 you listed, plus `enrollments` and `assignmentSubmissions`; see DATABASE.md for why).
- **Shared machinery** in `server/src/database/`: schema helpers (references, integer money, date-only, address, index helpers), a **soft-delete plugin** with automatic query filtering and delete protection, a **referential-integrity plugin** (existence check on save), **offset and cursor pagination**, a **transaction helper**, and a **relationship registry** that documents, enforces and tests every reference.
- **Seed data**: 117 permissions from a catalogue in code, seven system roles, six validated default settings.
- **Scripts**: `db:seed`, `db:indexes` (dry run), `db:indexes:apply`.
- **Tests**: schema, index, relationship, validation, seed and cursor tests that run in memory.

## Files

### Modified (5)
- `docker-compose.yml`: MongoDB now runs as a single-node replica set (needed for transactions)
- `server/.env.example`: connection string gains `?directConnection=true` for that local container
- `server/package.json`, `package.json`: `db:seed`, `db:indexes`, `db:indexes:apply` scripts
- `server/src/server.ts`: loads all models at startup

### New (49)
- `server/src/database/`: `constants`, `schema-helpers`, `subschemas`, `paginate`, `transaction`, `relationships`, `index`, `plugins/softDelete`, `plugins/referentialIntegrity`, `seed/permissions`, `seed/roles`, `scripts/seed`, `scripts/syncIndexes`, `database.test`
- `server/src/models/`: `index`, `models.test`, and one file per collection under `iam/`, `people/`, `academics/`, `finance/`, `hr/`, `library/`, `communication/`, `system/` (including `setting.registry`)
- `docs/DATABASE.md`, `docs/PHASE-03.md`

## Database changes

32 collections with their indexes (see the catalogue in DATABASE.md). Nothing is created until you run the app (development, `autoIndex`) or `db:indexes:apply`. No existing data is touched: Phase 1 and 2 stored nothing.

## API endpoints

None added.

## Security considerations

- Sensitive fields are excluded from queries by default (`passwordHash`, `students.medical`, `parents.nationalId`, `staff.nationalId`, `staff.baseSalary`) and must be requested explicitly. They are **stored in plain text**; add field-level or storage encryption before holding real data.
- Audit logs are append-only at the model level (updates and deletes throw) and snapshots are redacted by `redactAuditPayload()`. Someone with direct database access can still change them; restrict write access for the application's database user on that collection if that matters.
- Money is integer minor units; payments and fees are never deleted, only voided or cancelled, each change auditable.
- Uniqueness and "one open loan per borrower" are enforced by indexes, not application code.
- Mass assignment: schemas use `strict` (unknown fields are dropped), but services must still pick fields explicitly from validated input; never `new Model(req.body)`.
- `seed` creates no users and no passwords.
- The local MongoDB container has no authentication and listens on localhost only; development use only.

## Commands

```bash
npm install
npm test                         # 61 tests, no database required
npm run typecheck
npm run db:up                    # MongoDB replica set (first start takes ~10 s to initialise)
cp server/.env.example server/.env   # if you have not already; then check MONGODB_URI
npm run db:seed                  # permissions, roles, settings
npm run db:indexes               # should report indexes needing creation, or "in sync" after the server has run once
npm run dev                      # models load at startup; with autoIndex the indexes are built
```

To inspect: `docker exec -it sms-mongo mongosh school_management --eval "db.getCollectionNames()"` should list all 32 collections after `db:indexes:apply`, and `db.roles.countDocuments()` should be 7 after `db:seed`.
