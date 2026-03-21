# Contributing Guide

## Development Environment Setup

```bash
git clone <repo-url>
cd forumcore
npm install
cp .env.example .env
# Edit the .env file
npx prisma migrate dev
npm run dev
```

## Git Workflow

### Branch Strategy

Two permanent branches:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, stable. Receives merges from `develop` only. |
| `develop` | Integration branch. All feature branches merge here first. |

**Flow:** `feature branch` → PR → `develop` → PR → `main`

### Branch Naming

Branches are named after the **feature**, not the phase. Do not include phase numbers.

```
<type>/<short-feature-description>
```

| Prefix | Usage | Example |
|--------|-------|---------|
| `feat/` | New feature | `feat/rich-text-editor` |
| `fix/` | Bug fix | `fix/notification-duplicate` |
| `chore/` | Tooling, dependencies | `chore/upgrade-prisma` |
| `refactor/` | Code improvement | `refactor/thread-queries` |

### Commit Message Format

[Conventional Commits](https://www.conventionalcommits.org/) format. **All commit messages must be in English.**

```
<type>(<scope>): <description>

feat(editor): add TipTap markdown support
fix(auth): redirect to login when session expires
chore(deps): update prisma to 7.x
```

**Scope examples:** `auth`, `threads`, `posts`, `categories`, `users`, `admin`, `db`, `ui`, `editor`, `tags`

### PR Process

#### Feature → develop

1. Branch off from `develop`: `git checkout -b feat/rich-text-editor develop`
2. Make changes and commit
3. `npm run build` — build must pass
4. `npm run typecheck` — no TypeScript errors
5. Open a PR targeting **`develop`**, include Linear ID: `feat(editor): add TipTap — Closes DRA-35`
6. Merge into `develop`

#### develop → main

1. Open a PR from `develop` → `main`
2. Title: `release: <brief description of what's included>`
3. All features in the batch must be tested and stable
4. Merge into `main` → triggers Coolify deploy

## Multiple Agents (Claude Code + Cursor)

When two AI agents work simultaneously:

- **Each agent works on a different branch** — never work on the same branch concurrently
- Always branch off from `develop`, not `main`
- Run `git status` before starting a new task
- Stay up to date with `git pull origin develop --rebase` before committing

## Code Standards

### Naming

| Type | Format | Example |
|------|--------|---------|
| Component file | PascalCase | `ThreadCard.tsx` |
| Action/query | camelCase | `threadActions.ts` |
| Hook | camelCase + `use` | `useInfiniteScroll.ts` |
| Constant | UPPER_SNAKE_CASE | `MAX_POST_LENGTH` |

### Server Actions

```ts
// src/server/actions/threadActions.ts
export async function createThread(...) {}
export async function updateThread(...) {}
export async function deleteThread(...) {}
```

### Import Order

```ts
// 1. React/Next.js
// 2. External packages
// 3. Internal modules (@/ alias)
// 4. Type imports
```

## Testing

```bash
npm run test          # Vitest unit/integration tests
npm run test:e2e      # Playwright E2E tests
npm run test:coverage # Coverage report
```

### What to Test

- ✅ Server Actions (auth checks, input validation, success case)
- ✅ Utility functions (slugify, formatDate, etc.)
- ✅ Zod validation schemas
- ✅ Critical E2E flows (register, login, thread creation)
- ❌ shadcn/ui components
- ❌ Snapshot tests

## Environment Variables

All env vars are validated with Zod through `src/env.ts`. When adding a new variable:

1. Add the schema rule to `src/env.ts`
2. Add it with a description to `.env.example`
3. Set the production value in Coolify
4. Set the local value in `.env` (do not commit to the repo)

## Database Changes

```bash
# After a schema change
npx prisma migrate dev --name <descriptive-name>
npx prisma generate
```

Migration names should be descriptive: `add_reaction_table`, `add_thread_pin_field`
