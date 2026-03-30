#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
pnpm prisma migrate deploy

# Generate Prisma client (in case it's needed)
echo "Generating Prisma client..."
pnpm prisma generate

# Start the application
echo "Starting the application..."
exec "$@"