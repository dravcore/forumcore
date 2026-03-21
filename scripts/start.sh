#!/bin/sh
# ForumCore startup script
# Deploy sırasında DB migration'ları çalıştırır, sonra uygulamayı başlatır.

set -e

echo "[start] Running database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[start] Starting Next.js server..."
exec node server.js
