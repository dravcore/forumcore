# Project Structure

## Root Directory

```
forumcore/
├── .cursor/
│   └── rules/               # Cursor AI rules (.mdc)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
├── public/                  # Static files
├── src/                     # Application code
├── tests/
│   └── e2e/                 # Playwright E2E tests
├── .env.example             # Required env var template
├── CLAUDE.md                # Claude Code context
├── CONTRIBUTING.md          # Development guidelines
├── SECURITY.md              # Security policy
└── STRUCTURE.md             # This file
```

## src/ Directory

```
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Route group — auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (forum)/                 # Route group — forum pages
│   │   ├── c/
│   │   │   └── [slug]/          # Category page
│   │   │       └── page.tsx
│   │   └── t/
│   │       └── [slug]/          # Thread detail page
│   │           └── page.tsx
│   ├── admin/                   # Admin panel
│   │   ├── _components/         # Admin-only components
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/        # Better Auth handler
│   │   └── sse/                 # Server-Sent Events
│   ├── error.tsx                # Global error page
│   ├── not-found.tsx            # 404 page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/
│   ├── ui/                      # shadcn/ui components (do not touch)
│   ├── forum/                   # Forum-specific components
│   │   ├── ThreadCard.tsx
│   │   ├── PostItem.tsx
│   │   └── CategoryList.tsx
│   └── shared/                  # Shared general components
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── UserAvatar.tsx
│
├── lib/
│   ├── db.ts                    # Prisma Client singleton
│   ├── auth.ts                  # Better Auth (server) config
│   ├── auth-client.ts           # Better Auth (client) config
│   ├── env.ts                   # Environment validation (Zod)
│   ├── logger.ts                # Logging utility
│   └── utils.ts                 # cn() and general utils
│
├── server/
│   ├── actions/                 # Server Actions (mutations)
│   │   ├── threadActions.ts
│   │   ├── postActions.ts
│   │   ├── userActions.ts
│   │   └── __tests__/           # Action tests
│   ├── queries/                 # DB read functions
│   │   ├── threadQueries.ts
│   │   ├── categoryQueries.ts
│   │   └── __tests__/
│   └── validations/             # Zod schemas
│       ├── threadValidations.ts
│       └── postValidations.ts
│
└── types/                       # Shared TypeScript types
    ├── thread.types.ts
    └── user.types.ts
```

## Prisma Schema Models

| Model | Description | Phase |
|-------|-------------|-------|
| `User` | Users — Better Auth compatible + forum fields (username, role, bio) | 1 |
| `Session` | Better Auth sessions | 1 |
| `Account` | Better Auth OAuth accounts | 1 |
| `Verification` | Email verification tokens | 1 |
| `Category` | Forum categories (slug, order) | 1 |
| `Thread` | Threads (isPinned, isLocked, softDelete) | 1 |
| `Post` | Replies (content, editedAt, softDelete) | 1 |
| `Reaction` | Likes/reactions | 5 |
| `Notification` | Notifications | 6 |
| `Report` | User reports | 5 |

## Cursor AI Rules

Files under `.cursor/rules/` define the Cursor agent's context:

| File | Scope | Always Active |
|------|-------|:---:|
| `project.mdc` | General rules, stack | ✅ |
| `security.mdc` | Security requirements | ✅ |
| `conventions.mdc` | Naming, file structure | ✅ |
| `git.mdc` | Branch/commit strategy | ✅ |
| `database.mdc` | Prisma, query rules | — |
| `components.mdc` | React component rules | — |
| `design.mdc` | UI/UX standards | — |
| `auth.mdc` | Better Auth usage | — |
| `performance.mdc` | N+1, caching, bundle | — |
| `error-handling.mdc` | Error handling | — |
| `testing.mdc` | Test strategy | — |
| `env-config.mdc` | Environment validation | — |
