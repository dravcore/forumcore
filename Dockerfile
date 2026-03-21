# =============================================================================
# ForumCore — Multi-stage Dockerfile (Next.js standalone output)
# Coolify: "Dockerfile" build pack seç, port 3000
# =============================================================================

FROM node:20-alpine AS base

# ─── Deps: sadece bağımlılıkları kur ────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci

# ─── Builder: uygulamayı derle ───────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client üret (DB bağlantısı gerekmez)
RUN npx prisma generate

# Next.js standalone build
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time'da gerçek DB gerekmez — placeholder değerler
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-min-32-chars"
RUN npm run build

# ─── Runner: sadece çalıştırmak için gerekenler ──────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Prisma schema + migration dosyaları (migrate deploy için gerekli)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src/generated ./src/generated

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
