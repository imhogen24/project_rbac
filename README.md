# PROJECT_RBAC — Team Exercise

This is the sandbox repository for the IMHOGEN dev team onboarding exercise.
Build a working RBAC system using the same stack and operating procedures as the ERM platform.

The goal is to practice the team SOP end-to-end: picking up a Linear issue, branching,
building to standard, opening a PR, getting it reviewed, and merging — before touching ERM.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) + TypeScript strict |
| UI | Tailwind CSS + shadcn/ui |
| Auth | better-auth (HTTP-only cookie sessions) |
| Database | Drizzle ORM + Neon PostgreSQL |
| Env management | dotenvx (encrypted `.env`) |
| Package manager | pnpm |
| Deployment | Vercel |

---

## Quick start

```bash
git clone https://github.com/imhogen24/PROJECT_RBAC.git
cd PROJECT_RBAC
pnpm install
```

Set up your environment:

```bash
cp .env.example .env
# Fill in your values, then encrypt:
pnpm dotenvx encrypt
```

The encrypted `.env` is safe to commit. Your decryption key is in `.env.keys` — never commit that file.

Run the app:

```bash
pnpm dev
```

> **First user to sign up becomes the admin.** There is no pre-created admin account.

---

## Key documents

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack, folder boundaries, invariants — read before writing any code |
| [docs/RBAC_FEATURE_SPEC.md](./docs/RBAC_FEATURE_SPEC.md) | What to build, Linear issues, acceptance criteria |
| [docs/team/README.md](./docs/team/README.md) | Team handbook — roster, quick links, read order |
| [docs/team/WORKING_A_TASK.md](./docs/team/WORKING_A_TASK.md) | Step-by-step SOP from Linear pickup to merge |

Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) before opening any file in the repo.
It is the team's contract.

---

## Rules that never change

- **No `any`** — use `unknown` and narrow it, or define the type
- **App Router only** — no Pages Router, no `getServerSideProps`
- **Server Components by default** — add `"use client"` only when you need state, effects, or browser APIs
- **Zod on every external input** — form submissions, query params, request bodies
- **RBAC guard on every authenticated mutation** — `requireRole()` before any DB write
- **No hardcoded colors** — Tailwind design-system tokens only
- **`pnpm build` must pass** before opening a PR — the pre-commit hook enforces this locally

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooler URL) |
| `BETTER_AUTH_SECRET` | Random secret for session signing (server only) |
| `BETTER_AUTH_URL` | Full URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |

Never prefix `BETTER_AUTH_SECRET` or `DATABASE_URL` with `NEXT_PUBLIC_`.
