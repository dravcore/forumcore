# ForumCore

Self-hosted, modern forum platform. Runs on Coolify with a Next.js 16 + TypeScript + PostgreSQL + Better Auth stack.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | Better Auth |
| Storage | MinIO |
| Cache | Redis |
| Deploy | Coolify (self-hosted) |

## Requirements

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd forumcore
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the required values.

### 3. Prepare the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

npx prisma studio    # DB visual interface
npx prisma migrate dev --name <name>   # New migration
```

## Deploy (Coolify)

1. Create a new Next.js service in Coolify (Nixpacks)
2. Start PostgreSQL and Redis services from Coolify
3. Define environment variables via Coolify UI
4. Connect the GitHub repository — auto-deploy on push

See `CONTRIBUTING.md` for deployment details.

## Project Structure

See [`STRUCTURE.md`](./STRUCTURE.md) for the detailed structure.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development process, branch strategy, and rules.

## Security

See [`SECURITY.md`](./SECURITY.md) for reporting security vulnerabilities.
