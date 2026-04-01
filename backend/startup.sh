#!/bin/sh
# startup.sh — Railway production entry-point
#
# Prisma requires a direct (non-pooler) database URL for "migrate deploy".
# If the operator only sets DATABASE_URL (the PgBouncer/pooler URL), derive
# DIRECT_DATABASE_URL automatically by removing "-pooler" from the hostname.
#
# Neon DB pooler hostname pattern:
#   ep-<slug>-pooler.<region>.neon.tech  →  ep-<slug>.<region>.neon.tech
#
# If DIRECT_DATABASE_URL is already set in the environment, it is used as-is.

if [ -z "$DIRECT_DATABASE_URL" ]; then
  # Strip "-pooler" from DATABASE_URL hostname to get the direct endpoint.
  # Only replaces "-pooler" immediately before the first "." after the "@" host
  # segment, so credentials or the database name are never touched.
  export DIRECT_DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/\(postgresql:\/\/[^@]*@[^\/]*\)-pooler\(\.[^\/]*\)/\1\2/')
  echo "[startup] DIRECT_DATABASE_URL not set — derived from DATABASE_URL"
  echo "[startup] DIRECT_DATABASE_URL host: $(echo "$DIRECT_DATABASE_URL" | sed 's|.*@||' | sed 's|/.*||')"
fi

# Run pending migrations (idempotent; safe to run on every deploy)
echo "[startup] Running prisma migrate deploy …"
npx prisma migrate deploy

# Start the Node.js server
echo "[startup] Starting Node.js server …"
exec node dist/index.js
