#!/bin/bash

# Script to apply variantPrice migration to Cloudflare D1 database
# This adds variantPrice column to order_items table for better tracking

set -e

echo "🔄 Applying variantPrice migration to D1 database..."

cd backend

# Apply migration to remote D1 database
wrangler d1 execute store-db \
  --remote \
  --file=./migrate-variant-price.sql

echo "✅ Migration applied successfully!"
echo ""
echo "📝 Changes made:"
echo "  - Added variantPrice column to order_items"
echo ""
echo "💡 Purpose:"
echo "  - Track exact variant price at order time"
echo "  - Better historical price tracking"
echo "  - Easier to see price differences between base and variant"
