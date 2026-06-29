# Working a Task

You have a Linear issue. Follow these steps until it is done.

---

## 1. Pick up

Open your Linear issue. Move the status to **In Progress**.

## 2. Understand

Read the issue description and acceptance criteria fully before writing any code.
If anything is unclear, comment on the Linear issue before you start.

## 3. Branch

Copy the branch name from your Linear issue and create the branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b <branch-name-from-linear>
```

## 4. Build

Follow [docs/ARCHITECTURE.md](../ARCHITECTURE.md) without exception:

- TypeScript strict — no `any`, all types explicit
- Server Components by default — `"use client"` only when strictly required
- Route handler chain: Zod → session → `requireRole()` → DB write
- Guards return `{ ok, error, status }` — never inline a role check in a component
- No hardcoded colors — Tailwind design-system tokens only

## 5. Check it works

Run `pnpm dev` and confirm the feature works as the issue describes.
Run `pnpm build` — it must pass before you open a PR. The pre-commit hook will also
catch type errors and Biome violations before your commit goes through.

## 6. Open a PR

Push your branch and open a pull request against `main`. Include:

- Linear issue link
- What changed (one short paragraph)
- How to test it (numbered steps)

## 7. After review

Address comments, push updates to the same branch, and re-request review when ready.

After your PR merges: check out `main`, pull, and do not reuse the merged branch.

---

## Do not

- Start work not in Linear
- Push directly to `main` — branch protection enforces this
- Open a PR where `pnpm build` fails

---

## Stuck?

Post in **Google Chat** and leave the same message as a comment on your **Linear issue**.
Do not stay blocked for more than 2 hours without flagging it.

---

[← Back to handbook](./README.md)
