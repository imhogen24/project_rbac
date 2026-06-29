<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# Read Before Anything Else

Read in this exact order before any implementation:

1. [README.md](./README.md)
2. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. [docs/RBAC_FEATURE_SPEC.md](./docs/RBAC_FEATURE_SPEC.md)
4. [docs/team/README.md](./docs/team/README.md)
5. [docs/team/WORKING_A_TASK.md](./docs/team/WORKING_A_TASK.md)

## Rules That Never Change

- No `any` — use `unknown` and narrow, or define the type explicitly
- App Router only — no Pages Router conventions
- Server Components by default — `"use client"` only when strictly required
- Zod validates all external input before any action or handler proceeds
- Every authenticated mutation calls `requireRole()` before touching the database
- No hardcoded colors — only Tailwind design-system tokens

## File Naming

- Next.js folders and files: `kebab-case`
- Documentation markdown: `SCREAMING_SNAKE_CASE.md`
