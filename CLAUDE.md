# ForumCore

Self-hosted forum platform. Next.js 16 App Router + TypeScript + PostgreSQL + Better Auth, running on Coolify.

## Stack

- **Framework:** Next.js 16 App Router (`src/` directory, `@/*` alias)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth
- **Storage:** MinIO (Coolify)
- **Cache:** Redis (Coolify)
- **Deploy:** Coolify (self-hosted) — `output: "standalone"` required

## Project Structure

```
src/
├── app/          # Next.js App Router pages and API routes
├── components/   # UI components
│   └── ui/       # shadcn/ui components (do not edit manually, use npx shadcn add)
├── lib/          # Singletons: auth.ts, db.ts, utils.ts
├── server/       # Server-only business logic (queries, actions)
└── types/        # Shared TypeScript types
prisma/
└── schema.prisma
```

## Coding Rules

- Server Components by default; add `"use client"` only when necessary
- Data fetching via Server Components or Server Actions
- API routes only for SSE, webhooks, and external service integrations
- Form validation with Zod
- `src/lib/db.ts` is the Prisma Client singleton — do not create `new PrismaClient()` elsewhere
- Environment variables are managed via Coolify UI; `.env` is never committed to the repo
- Do not use Vercel-specific features (Edge Runtime, ISR, etc.)
- `output: "standalone"` must remain in next.config.ts — required for Coolify

## Database

- Use Prisma ORM
- Migration in development: `npx prisma migrate dev`
- Migration in deployment: `npx prisma migrate deploy`
- Schema: `prisma/schema.prisma`

## Security

- Validate input with Zod at the start of every Server Action, check session + role
- Do not use `dangerouslySetInnerHTML`; always sanitize user content
- Do not expose DB/stack trace details in error messages to the user
- For file uploads, validate MIME type + size, rename files with UUID
- Do not use string interpolation inside `$queryRaw` (use `Prisma.sql`)
- Do not hardcode secrets; access `process.env` through `src/env.ts`

## Performance

- Avoid N+1 queries: fetch relations in list queries using `include`/`select` in a single query
- Do not fetch large text fields (`content`) in list views; fetch them on detail pages
- Never fetch entire lists at once — always use pagination (default: 20 records)
- Combine parallelizable queries with `Promise.all`
- Cache frequently read static data with `unstable_cache` or Redis
- Use Next.js `<Image>` instead of `<img>`

## Error Handling

- Server Actions should return `{ success, error }` structure instead of throwing exceptions
- Do not wrap `notFound()` and `redirect()` in try/catch — Next.js throws them as special exceptions
- Define `error.tsx` and `not-found.tsx` for every route
- Do not leave `console.log` in production; use `src/lib/logger.ts` for logging

## UI/UX Design Standards

When writing UI code, think like an experienced UI/UX designer. Visual quality, hierarchy, and user experience are equally important as functionality.

- **Visual hierarchy:** Guide the user's eye with size, color, and spacing
- **Whitespace:** Do not write cramped UI; use adequate padding/margin for breathing room
- **Consistency:** Use shadcn/ui tokens (`muted-foreground`, `destructive`, `accent`, etc.), do not use raw hex or `gray-*` fixed colors
- **Feedback:** Every action must have a visual response — hover, focus, loading, error, success
- **Empty states:** Do not leave empty lists; show a descriptive message and action button
- **Accessibility:** `focus-visible:ring`, `aria-label` on icon buttons, use `<button>` instead of `<div onClick>`
- **Mobile-first:** Every component must be mobile-responsive; do not use fixed widths (`w-[400px]`)
- **Forms:** Label on top, error as `text-destructive text-sm` below, submit button disabled in loading state

## Naming Conventions

- Files: components in `PascalCase.tsx`, others in `camelCase.ts`
- Variables/functions: `camelCase` — booleans prefixed with `is/has/can`
- Server actions: `createX`, `updateX`, `deleteX`, `pinX` format (`src/server/actions/`)
- Queries: `getXByY`, `getXs` format (`src/server/queries/`)
- Event handlers: `handleSubmit`, `handleDelete` (`handle` prefix)
- Constants: `UPPER_SNAKE_CASE`

## Git Workflow

Two permanent branches:
- **`main`** — production-ready, stable. Never commit directly.
- **`develop`** — integration branch. Features merge here first, then `develop` → `main`.

Feature branches are named after the feature, not the phase:
- Branch format: `feat/rich-text-editor`, `fix/notification-duplicate`
- Commit format: `feat(editor): add TipTap markdown support` (Conventional Commits)
- **All commit messages must be in English**
- Flow: `feature branch` → PR → `develop` → PR → `main`
- Multiple agents (Claude + Cursor) work on **different branches** simultaneously
- Before opening a PR: build must pass, no TypeScript errors

## Test Strategy

- Test server actions and utility functions with **Vitest**
- Test critical E2E flows with **Playwright** (register, login, thread creation)
- Test files go in `__tests__/` next to the file being tested
- Minimum per server action: unauthorized access test + invalid input test
- Do not write snapshot tests; avoid component render tests

## Environment Variables

- All env vars are validated with Zod through `src/env.ts` (`@t3-oss/env-nextjs`)
- Do not use `process.env.X` directly; always access through `import { env } from "@/env"`
- Keep `.env.example` up to date at all times
- Secrets must never have the `NEXT_PUBLIC_` prefix

## Linear

Project: ForumCore (Dravcore workspace)
Issues start from DRA-5 — every task is a Linear issue.
