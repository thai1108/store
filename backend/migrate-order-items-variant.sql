-- Migration: Add variant support to order_items table
-- This migration adds variantId and variantSize columns to order_items
-- to store variant information when orders are placed

-- Step 1: Add variantId column (nullable because existing orders don't have variants)
ALTER TABLE order_items ADD COLUMN variantId INTEGER;

-- Step 2: Add variantSize column (nullable because existing orders don't have variants)
ALTER TABLE order_items ADD COLUMN variantSize TEXT;

-- Note: We don't add foreign key constraint because:
-- 1. It would require backfilling existing data
-- 2. Historical order items should remain even if variants are deleted
-- 3. We validate variants at order creation time, not at query time
