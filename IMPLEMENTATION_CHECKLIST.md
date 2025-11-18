# Implementation Checklist

## ✅ Completed Tasks

### Database Layer
- [x] Created `product_variants` table schema
- [x] Created `product_images` table schema  
- [x] Updated `order_items` with variant fields
- [x] Updated `cart_items` with variant fields
- [x] Created migration SQL script
- [x] Added proper indexes and foreign keys

### Backend - Types & Interfaces
- [x] Created `ProductVariant` interface
- [x] Created `ProductImage` interface
- [x] Updated `Product` interface with variants/images
- [x] Updated `CartItem` with variant fields
- [x] Updated `OrderItem` with variant fields

### Backend - Repository
- [x] Created `loadVariantsAndImages()` helper
- [x] Updated `getAll()` to load variants/images
- [x] Updated `getById()` to load variants/images
- [x] Updated `create()` to insert variants/images
- [x] Updated `update()` to manage variants/images
- [x] Proper cascade delete on product removal

### Backend - API Routes
- [x] Product creation supports variants/images
- [x] Product update supports variants/images
- [x] Added `POST /api/admin/upload` endpoint
- [x] Multi-file upload to R2
- [x] URL generation for uploaded files

### Frontend - Types
- [x] Synced types with backend
- [x] Added variant/image interfaces
- [x] Updated cart/order item types

### Frontend - Services
- [x] Added `uploadImages()` to admin service
- [x] Handles FormData for multi-file upload
- [x] Returns array of uploaded URLs

### Frontend - Stores
- [x] Updated `addToCart()` to handle variants
- [x] Updated `removeFromCart()` with variant support
- [x] Updated `updateQuantity()` with variant support
- [x] Unique cart key for product+variant combo
- [x] Price calculation with variant adjustment

### Frontend - Admin Components
- [x] ProductModal: Multi-image upload UI
- [x] ProductModal: Image preview/remove
- [x] ProductModal: Variant form (add/remove)
- [x] ProductModal: Auto-upload on save
- [x] ProductModal: Validation for required fields

### Frontend - Customer Components  
- [x] ProductCard: Image carousel
- [x] ProductCard: Image navigation (prev/next/dots)
- [x] ProductCard: Variant selector buttons
- [x] ProductCard: Dynamic price with adjustment
- [x] ProductCard: Stock status per variant
- [x] ProductCard: Require variant selection before add to cart

### Frontend - Cart View
- [x] Display variant size as tag
- [x] Unique row key for product+variant
- [x] Pass variant to update/remove functions
- [x] Show variant in product name

### Documentation
- [x] Detailed implementation guide (PRODUCT_VARIANTS_IMAGES.md)
- [x] Deployment guide (VARIANTS_DEPLOYMENT.md)
- [x] Vietnamese summary (SUMMARY_VI.md)

## 🧪 Testing Checklist

### Admin Panel Tests
- [ ] Login as admin
- [ ] Create product without variants (legacy mode)
- [ ] Create product with variants only
- [ ] Create product with images only
- [ ] Create product with both variants & images
- [ ] Upload single image
- [ ] Upload multiple images (5+)
- [ ] Remove uploaded image before save
- [ ] Add variant with stock
- [ ] Add variant with price adjustment
- [ ] Remove variant before save
- [ ] Update existing product - add variants
- [ ] Update existing product - remove variants
- [ ] Update existing product - change images
- [ ] Delete product with variants/images

### Customer Tests
- [ ] View product without variants (normal flow)
- [ ] View product with single image
- [ ] View product with multiple images
- [ ] Navigate image carousel (prev/next)
- [ ] Click image indicator dots
- [ ] View product with variants
- [ ] Select different sizes
- [ ] Price updates when selecting size
- [ ] Out of stock variant is disabled
- [ ] Try add to cart without selecting variant (should warn)
- [ ] Add to cart with variant selected
- [ ] Add same product with different sizes
- [ ] View cart shows correct variants
- [ ] Update quantity for specific variant
- [ ] Remove specific variant from cart
- [ ] Checkout with variants
- [ ] View order history with variants

### Integration Tests
- [ ] Image upload to R2 succeeds
- [ ] Images accessible via URL
- [ ] Variant stock decreases on order
- [ ] Cart persists with variants
- [ ] Cart syncs to server with variants
- [ ] Order includes variant information
- [ ] Admin sees variant info in orders

### Edge Cases
- [ ] Product with 0 images (fallback works)
- [ ] Product with 1 variant only
- [ ] Product with 10+ variants
- [ ] Variant with negative price adjustment
- [ ] Variant with 0 stock
- [ ] Very large image upload (>10MB should fail)
- [ ] Invalid file type upload (should fail)
- [ ] Concurrent cart updates with variants
- [ ] Cart merge with different variants

## 🚀 Deployment Steps

1. **Pre-deployment**
   - [ ] Backup production database
   - [ ] Test migration on staging
   - [ ] Verify R2 bucket configuration

2. **Database Migration**
   - [ ] Stop production services
   - [ ] Run migration script
   - [ ] Verify tables created
   - [ ] Check existing data preserved

3. **Backend Deployment**
   - [ ] Deploy to Cloudflare Workers
   - [ ] Verify environment variables
   - [ ] Test API endpoints

4. **Frontend Deployment**
   - [ ] Build production bundle
   - [ ] Deploy static files
   - [ ] Clear CDN cache

5. **Post-deployment**
   - [ ] Smoke test critical flows
   - [ ] Monitor error logs
   - [ ] Test image uploads
   - [ ] Verify cart functionality

## 📊 Performance Considerations

- [x] Batch load variants/images (1 query per table)
- [x] Proper database indexes
- [x] Image lazy loading in carousel
- [x] Optimistic UI updates
- [ ] Consider image optimization/CDN
- [ ] Monitor R2 storage usage
- [ ] Cache product data with variants

## 🐛 Known Limitations

- Variant updates replace all variants (not incremental)
- Image order is based on displayOrder field only
- No image compression before upload
- No variant SKU/barcode tracking
- Stock is not automatically decreased (requires order processing)

## 📝 Future Enhancements

- [ ] Variant SKU management
- [ ] Image optimization/compression
- [ ] Bulk variant import (CSV)
- [ ] Variant combinations (size + color)
- [ ] Low stock alerts per variant
- [ ] Variant-specific images
- [ ] Image zoom/lightbox
- [ ] Drag-drop image reordering
