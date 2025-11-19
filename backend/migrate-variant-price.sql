-- Migration: Add variantPrice to order_items for better tracking
-- This allows us to see the exact variant price at the time of order

-- Add variantPrice column (nullable for backward compatibility)
ALTER TABLE order_items ADD COLUMN variantPrice REAL;

-- Note: 
-- - variantPrice = product.price + variant.priceAdjustment
-- - This is calculated and stored at order time
-- - Existing orders will have NULL variantPrice (they still have price column)
