#!/bin/bash

# Script to apply database migration for address and avatarUrl fields

echo "Applying database migration..."

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI is not installed"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Apply migration to local database
echo "Adding address and avatarUrl columns to users table..."
wrangler d1 execute DB --local --file=migrate-user-fields.sql

echo "Migration completed successfully!"
echo "Note: If you have a remote database, run: wrangler d1 execute DB --file=migrate-user-fields.sql"
