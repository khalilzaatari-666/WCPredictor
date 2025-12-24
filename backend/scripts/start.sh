#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding achievements..."
npm run seed:achievements

echo "Starting application..."
exec npm start
