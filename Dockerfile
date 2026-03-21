# =============================================================================
# ForumCore — Multi-stage Dockerfile (Next.js standalone output)
# Coolify: select "Dockerfile" build pack, port 3000
# =============================================================================

FROM node:20-alpine AS base

# ─── Deps: install dependencies only ────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci

# ─── Builder: compile the application ───────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (no DB connection needed)
RUN npx prisma generate

# Next.js standalone build
ENV NEXT_TELEMETRY_DISABLED=1
# No real DB needed at build time — placeholder values
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-min-32-chars"
RUN npm run build

# ─── Runner: only what is needed to run the app ─────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Packages required for Prisma CLI + migrations (install as root so engines are downloaded)
COPY package.json package-lock.json ./
RUN npm install prisma@7.5.0 dotenv --no-save

# Prisma schema + config + generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

# Give ownership of node_modules to the nextjs user
RUN chown -R nextjs:nodejs /app/node_modules

# Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Startup script (migrate + start)
COPY --chown=nextjs:nodejs scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
