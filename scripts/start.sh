#!/bin/sh
# ForumCore startup script
# Runs DB migrations on deploy, then starts the application.

set -e

echo "[start] Running database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[start] Starting Next.js server..."
exec node server.js
