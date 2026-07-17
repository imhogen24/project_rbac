# Architecture

Read this before writing any code. These are the rules the codebase is built on.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) + TypeScript strict |
| UI | Tailwind CSS + shadcn/ui |
| Auth | better-auth (HTTP-only cookie sessions) |
| Database | Drizzle ORM + Neon PostgreSQL |
| Env management | dotenvx (encrypted `.env`) |
| Linting / formatting | Biome |
| Package manager | pnpm |
| Deployment | Vercel |

---

## Folder structure

```
src/app/          Pages, layouts, and API route handlers
components/       UI only — no DB calls, no auth checks
lib/              Shared infra: auth.ts, auth-guards.ts, db.ts
db/               Drizzle schema and migrations
server/           Domain logic (pure TypeScript, called from handlers)
actions/          Server Actions for authenticated UI mutations
```

---

## System boundaries

- `lib/` does not import from `app/` or `components/`
- `components/` is UI only — it receives props and fires callbacks; it never queries the DB or reads the session
- Route handlers own the request pipeline in this order:
  1. Input validation (Zod) → 400 on failure
  2. Session read → 401 if missing
  3. Role check via `requireRole()` → 403 if denied
  4. DB write via Drizzle
- Guards live in `lib/auth-guards.ts` — never inline a role check in a page or component

---

## Auth and access model

better-auth manages sessions via HTTP-only cookies. On sign-in, the user's `role` field
is read from the `users` table and embedded in the session.


The default role for all new sign-ups is `engineer`.
The  `admin` role is not assigned automatically. Instead, it must be explicitly set in the database by an existing admin. Once a user has the `admin` role, they can promote other users (including engineers) to admin via the /api/users endpoint. This ensures role elevation is always a deliberate, auditable action performed by an authorized admin.

**Role enum:**

```typescript
type Role = "admin" | "engineer"
```

**Guard helper** (`lib/auth-guards.ts`):

```typescript
type GuardResult = { ok: true } | { ok: false; error: string; status: 401 | 403 }

function requireRole(session: Session | null, allowed: Role[]): GuardResult
```

Guards never throw. Handlers and actions check `result.ok` and return early on failure.

**Permissions:**

| Resource | admin | engineer |
|----------|-------|---------|
| Admin panel (`/admin`) | Yes | — |
| Dashboard (`/dashboard`) | Yes | Yes |
| GET `/api/me` | Yes | Yes |
| GET `/api/users` | Yes | — |
| POST `/api/users` | Yes | — |

UI role-gating is cosmetic. The server enforces regardless of what the UI shows, so hide features in the UI for a better user experience, but always enforce authorization on the server, because the frontend can never be trusted.

---

## Pre-commit hooks

The pre-commit hook runs automatically on every commit:

1. **Biome** — lint + format check (fails commit if violations exist)
2. **`tsc --noEmit`** — TypeScript type check (fails commit on type errors)

Fix all Biome and TypeScript errors before committing. Do not use `--no-verify` to skip hooks.

---

## Invariants

1. Role checks happen in route handlers and Server Actions — never in components.
2. Every authenticated mutation calls `requireRole()` before the DB write.
3. `client` role has no write path anywhere in the application.
4. `pnpm build` must pass before any PR is opened.
5. Zod validates all input at system boundaries (forms, query params, request bodies).
6. No hardcoded colors — all values via CSS custom properties from `globals.css`.

---

## Return shape

```typescript
{ success: true; data?: T }
{ success: false; error: string }
```

Route handlers add the correct HTTP status. Server Actions return the shape above — callers handle the error display.
