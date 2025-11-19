#!/bin/bash

# Script to apply order_items variant migration to Cloudflare D1 database
# This adds variantId and variantSize columns to order_items table

set -e

echo "🔄 Applying order_items variant migration to D1 database..."

cd backend

# Apply migration to remote D1 database
wrangler d1 execute store-db \
  --remote \
  --file=./migrate-order-items-variant.sql

echo "✅ Migration applied successfully!"
echo ""
echo "📝 Changes made:"
echo "  - Added variantId column to order_items"
echo "  - Added variantSize column to order_items"
echo ""
echo "🔒 Security improvements:"
echo "  - Order creation now validates prices from database"
echo "  - Variant stock is checked and decremented"
echo "  - Variant ownership is verified"
echo "  - Price tampering is prevented"
