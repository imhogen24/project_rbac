# RBAC Feature Specification

Read [ARCHITECTURE.md](./ARCHITECTURE.md) before this file.

---

## Goal

Build a working RBAC system on Next.js App Router using the same patterns as the ERM
platform: better-auth sessions with embedded roles, reusable guard helpers, and the
Zod → session → guard → DB handler chain.

---

## Roles

| Role | What they can do |
|------|-----------------|
| `admin` | Full access — all routes, all API endpoints, user management |
| `engineer` | Dashboard and own profile only; no admin panel, no user management |

**The first user to sign up becomes `admin`.** All subsequent sign-ups default to `engineer`.

---

## Permissions matrix

| Route / Action | admin | engineer |
|----------------|-------|---------|
| GET `/dashboard` | Yes | Yes |
| GET `/admin` | Yes | — |
| GET `/api/me` | Yes | Yes |
| GET `/api/users` | Yes | — |
| POST `/api/users` | Yes | — |

---

## Scope — In

- better-auth with email/password; first sign-up → `admin`, subsequent → `engineer`
- Role (`admin | engineer`) embedded in session at sign-in
- Sign-in page and sign-out Server Action
- Next.js proxy (formerly middleware) protecting `/dashboard/*` and `/admin/*`
- `lib/auth-guards.ts` — `requireRole(session, allowedRoles[])` returning `{ ok, error?, status? }`
- Dashboard visible to both roles with role-specific content
- Admin panel (`/admin`) — admin only; renders user list and create-user form
- `GET /api/me` — any authenticated user
- `GET /api/users` — admin only
- `POST /api/users` — admin only
- Biome + pre-commit hooks (lint, format, typecheck on every commit)
- dotenvx for encrypted env management
- GitHub Actions CI: typecheck + build on every PR to `main`

## Scope — Out

- OAuth providers
- Password reset / email verification
- Audit logging
- File uploads
- Any resource tracking beyond users

---

## Issues

Branch names are copied from Linear — do not invent them.

**Dependency order:**

```
01 (scaffold)
  ├── 02 (schema) → 03 (auth + guards)
  │     ├── 04 (proxy) → 05 (API routes)
  │     └── 06 (CI)
  └── 07 (design system)
        └── 08 (sign-in pages) ← needs 03 + 07
              └── 09 (dashboard) ← needs 04 + 08
                    └── 10 (admin panel)
```

---

### Issue 01 — Project Scaffold

**Assigned to:** Kennedy Anyidoho

**What to build:**
- Next.js App Router + TypeScript strict
- Folder skeleton matching ARCHITECTURE.md exactly: `src/app/`, `components/`, `lib/`, `db/`, `server/`, `actions/`, `scripts/`
- Tailwind CSS + shadcn/ui initialized (only `button`, `card`, `badge`)
- Path alias `@/` at project root
- dotenvx configured: `pnpm add -D @dotenvx/dotenvx`; dev script becomes `dotenvx run -- next dev`
- `.env.example` with all four required variables
- `drizzle.config.ts` stub pointing at `db/`
- Biome installed (`pnpm add -D @biomejs/biome`); `biome.json` configured
- Pre-commit hook (use `simple-git-hooks` + `nano-staged`):
  - Biome check on staged files
  - `tsc --noEmit` on the whole project
- Placeholder `middleware.ts` — no-op, passes all requests through
- Landing page at `/` with a shadcn/ui `Card` rendering "PROJECT_RBAC"
- `pnpm build` and `pnpm dev` working

**Acceptance criteria:**
- [ ] `pnpm dev` starts; landing page renders
- [ ] `pnpm build` passes with no TypeScript errors
- [ ] Folder structure matches ARCHITECTURE.md
- [ ] `.env.example` documents all four required variables
- [ ] Committing a file with a Biome violation fails the commit
- [ ] Committing a file with a TypeScript error fails the commit
- [ ] `dotenvx run -- pnpm dev` works with a populated `.env`

---

### Issue 02 — Database Schema

**Assigned to:** Emmanuel Narh

**What to build:**
- Drizzle client in `lib/db.ts` using `DATABASE_URL`
- `db/schema.ts`:
  - `roleEnum` — values: `admin`, `engineer`
  - `users` table: `id` (uuid pk), `email` (unique, not null), `hashedPassword` (not null), `role` (roleEnum, default `engineer`), `name` (not null), `createdAt` (default now)
- `pnpm db:migrate` script using drizzle-kit

> Read the better-auth Drizzle adapter docs before finalizing the schema. better-auth
> requires specific columns and creates its own session/account tables. The schema must
> satisfy those requirements so issue 03 does not need breaking changes.

**Acceptance criteria:**
- [ ] `pnpm db:migrate` runs against a fresh Neon database with no errors
- [ ] Role enum exists with exactly 2 values (`admin`, `engineer`)
- [ ] `pnpm build` passes
- [ ] `lib/db.ts` is not imported from `app/` or `components/`

---

### Issue 03 — Auth Config and Guard Helper

**Assigned to:** Emmanuel Narh

The `requireRole` signature set here is fixed — all subsequent issues depend on it.

**What to build:**
- `lib/auth.ts` — better-auth with email/password provider; `role` embedded in session
- First-user-admin logic: on sign-up, check if `users` table has 0 rows → assign `admin`; otherwise assign `engineer`
- Auth API route at `src/app/api/auth/[...all]/route.ts` exporting `GET` and `POST` from `auth.handler`
- `lib/auth-guards.ts`:

```typescript
type Role = "admin" | "engineer";

type GuardResult =
  | { ok: true }
  | { ok: false; error: string; status: 401 | 403 };

export function requireRole(
  session: Session | null,
  allowedRoles: Role[]
): GuardResult
```

- `actions/auth.ts` — `signIn` and `signOut` Server Actions

**Acceptance criteria:**
- [ ] First sign-up receives `admin` role
- [ ] Second sign-up receives `engineer` role
- [ ] `POST /api/auth/sign-in` with valid credentials returns a session cookie containing `user.id` and `user.role`
- [ ] `requireRole(null, ["admin"])` → `{ ok: false, status: 401 }`
- [ ] `requireRole(engineerSession, ["admin"])` → `{ ok: false, status: 403 }`
- [ ] `requireRole(adminSession, ["admin", "engineer"])` → `{ ok: true }`
- [ ] `pnpm build` passes

---

### Issue 04 — Auth Proxy (Middleware)

**Assigned to:** Emmanuel Aweh

Read the Next.js middleware docs in `node_modules/next/dist/docs/` before implementing.

**What to build:**

Replace the no-op `middleware.ts` with real session protection:
- Match `/dashboard/*` and `/admin/*` via `config.matcher`
- Read session via `auth.api.getSession({ headers: req.headers })`
- No session → redirect to `/sign-in`
- Valid session → `NextResponse.next()` — no role check here (roles are enforced per-handler)
- All other routes untouched

**Acceptance criteria:**
- [ ] `GET /dashboard` with no session → redirects to `/sign-in`
- [ ] `GET /dashboard` with a valid session → 200
- [ ] `GET /admin` with an engineer session → reaches the page (middleware does not check role)
- [ ] `GET /` (landing) and `POST /api/auth/sign-in` are unaffected
- [ ] `pnpm build` passes

---

### Issue 05 — Protected API Routes

**Assigned to:** Emmanuel Aweh

Every handler follows this chain exactly: **Zod → session → `requireRole` → DB → return `{ success, data?, error? }`**

**What to build:**

`src/app/api/me/route.ts` — `GET`:
- Any authenticated user
- Returns `{ success: true, data: { id, email, name, role } }` — never `hashedPassword`

`src/app/api/users/route.ts` — `GET`:
- `admin` only
- Returns all users `{ id, email, name, role }[]`

`src/app/api/users/route.ts` — `POST`:
- `admin` only
- Zod schema: `{ email: string, name: string, role: Role, password: string }`
- Create user through better-auth (not raw DB insert — password must be hashed)
- Returns 201 with the created user

**Acceptance criteria:**
- [ ] `GET /api/me` — no session → 401; valid session → 200 (no `hashedPassword`)
- [ ] `GET /api/users` — engineer → 403; admin → 200
- [ ] `POST /api/users` — invalid body → 400; engineer → 403; admin + valid body → 201
- [ ] `pnpm build` passes

---

### Issue 06 — CI Pipeline

**Assigned to:** Enoch Sitsofe Nkrumah

**What to build:**

`.github/workflows/ci.yml`:
- Trigger: push to any branch + pull_request targeting `main`
- Steps: checkout → pnpm setup → `pnpm install --frozen-lockfile` → `pnpm build`
- Set `DATABASE_URL` to a dummy value in the CI env block — the build must not need a real DB connection to succeed

**Acceptance criteria:**
- [ ] CI runs on every PR to `main`
- [ ] CI passes on the main branch
- [ ] Temporarily introducing a TypeScript error causes CI to fail (confirm and revert)
- [ ] No real secrets appear in the workflow file

---

### Issue 07 — Design System

**Assigned to:** Christopher Lartey Mensah

No hardcoded hex values. No raw Tailwind color utilities (`text-blue-500`, `bg-gray-100`).
All colors via CSS custom properties only.

**What to build:**

`globals.css` — CSS custom properties for at minimum:
`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--destructive`, `--muted`, `--muted-foreground`, `--border`

Wire these into `tailwind.config.ts` via theme extension.

Three shared components (no pages):

`components/auth/sign-in-form.tsx` — `"use client"`:
- Props: `onSubmit: (email: string, password: string) => Promise<void>`, `error?: string`, `isLoading?: boolean`
- Does not call better-auth directly

`components/dashboard/role-banner.tsx` — Server Component:
- Props: `role: Role`
- Renders a badge and one sentence per role (`admin`: "You have full system access." / `engineer`: "You have access to your workspace.")

`components/dashboard/admin-user-table.tsx` — Server Component:
- Props: `users: Array<{ id: string; name: string; email: string; role: Role }>`
- Renders a table — never receives `hashedPassword`

**Acceptance criteria:**
- [ ] `globals.css` defines at least the 8 properties listed above
- [ ] No Tailwind color utility class in any component file
- [ ] All three components render and `pnpm build` passes

---

### Issue 08 — Sign-in and Sign-out Pages

**Assigned to:** Leigh Angelyn

**What to build:**

`src/app/(auth)/sign-in/page.tsx` — Server Component:
- If session exists → redirect to `/dashboard`
- Renders a `SignInClientWrapper` client component

`components/auth/sign-in-client.tsx` — `"use client"`:
- Wraps `SignInForm` from issue 07
- Wires `onSubmit` to the `signIn` Server Action
- On success → redirect to `/dashboard`
- On error → passes error string to `SignInForm`

Sign-out is a `<form>` in the dashboard layout (issue 09). Posts to `signOut` Server Action → redirects to `/sign-in`.

**Acceptance criteria:**
- [ ] Unauthenticated user sees the sign-in form
- [ ] Valid credentials → signed in → redirect to `/dashboard`
- [ ] Invalid credentials → error message shown in form
- [ ] Already-authenticated user at `/sign-in` → redirect to `/dashboard`
- [ ] `pnpm build` passes

---

### Issue 09 — Dashboard and Role-Based UI

**Assigned to:** Leigh Angelyn

All data fetching in Server Components — no client-side `fetch`.

**What to build:**

`src/app/(protected)/layout.tsx` — Server Component:
- Reads session; if missing → redirect to `/sign-in`
- Top nav: user name, role badge (from `RoleBanner`), sign-out form button

`src/app/(protected)/dashboard/page.tsx` — Server Component:
- Renders `RoleBanner` with current role
- Role-specific content:
  - `admin` — total user count (DB query) + link to `/admin`
  - `engineer` — "You are in your assigned workspace"

**Acceptance criteria:**
- [ ] Admin sees the admin panel link; engineer does not
- [ ] Sign-out button clears session and redirects to `/sign-in`
- [ ] Missing session in protected layout → redirect to `/sign-in`
- [ ] `pnpm build` passes

---

### Issue 10 — Admin Panel

**Assigned to:** Christopher Lartey Mensah

**What to build:**

`src/app/(protected)/admin/page.tsx` — Server Component:
- Server-side check: `session.user.role !== "admin"` → redirect to `/dashboard`
- Renders `AdminUserTable` with all users fetched server-side
- Renders a "Create User" section below the table

`components/admin/create-user-form.tsx` — `"use client"`:
- Fields: email, name, role (dropdown: `admin` | `engineer`), password
- Calls `POST /api/users` via `fetch`
- On success → `router.refresh()`
- On error → renders error message from API

**Acceptance criteria:**
- [ ] Admin at `/admin` sees the user table and create form
- [ ] Engineer/manager/client at `/admin` → redirect to `/dashboard`
- [ ] Admin can create a user via the form — confirm in DB
- [ ] Form shows API error on 400 or 403
- [ ] `pnpm build` passes

---

## Handler pattern (reference)

```typescript
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const session = await auth.api.getSession({ headers: req.headers });
  const guard = requireRole(session, ["admin"]);
  if (!guard.ok)
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });

  try {
    const result = await db.insert(users).values(parsed.data).returning();
    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```
