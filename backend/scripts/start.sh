#!/bin/sh
set -e

echo "Checking for failed migrations..."
# Mark any failed migrations as rolled back
npx prisma migrate resolve --rolled-back 20251223151020_init || true

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding achievements..."
npm run seed:achievements || echo "⚠️  Seeding skipped or failed (may already be seeded)"

echo "Starting application..."
exec npm start
