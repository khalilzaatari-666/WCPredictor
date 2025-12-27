#!/bin/sh
set -e

echo "Setting up upload directories with proper permissions..."
# Create directories if they don't exist
mkdir -p /app/uploads/predictions /app/uploads/previews /app/logs

# Change ownership to nodeapp user
chown -R nodeapp:nodejs /app/uploads /app/logs

# Set proper permissions
chmod -R 755 /app/uploads /app/logs

echo "✓ Directories ready"

# Switch to nodeapp user and run the start script
exec gosu nodeapp ./scripts/start.sh
