# Product Variants and Multiple Images Implementation

## Overview
Đã hoàn thành việc thêm tính năng:
1. **Product Variants (Sizes)**: Sản phẩm có thể có nhiều kích cỡ (M, L, XL, etc.) với stock và giá riêng
2. **Multiple Images**: Sản phẩm có thể có nhiều hình ảnh, upload lúc tạo sản phẩm, lưu trên R2

## Database Changes

### New Tables Created

1. **product_variants**
   - `id`: Primary key
   - `productId`: Foreign key to products
   - `size`: Text (M, L, XL, etc.)
   - `stock`: Integer (số lượng tồn kho)
   - `priceAdjustment`: Real (giá điều chỉnh, default 0)
   - `createdAt`, `updatedAt`: Timestamps

2. **product_images**
   - `id`: Primary key
   - `productId`: Foreign key to products
   - `imageUrl`: Text (URL của ảnh)
   - `displayOrder`: Integer (thứ tự hiển thị)
   - `createdAt`: Timestamp

### Updated Tables

1. **order_items**
   - Added: `variantId` (Integer, nullable)
   - Added: `variantSize` (Text, nullable)

2. **cart_items**
   - Added: `variantId` (Text, nullable)
   - Added: `variantSize` (Text, nullable)

### Migration Script
Schema đã được cập nhật trong file `backend/schema.sql`:
- Thêm bảng `product_images` và `product_variants`
- Cập nhật `order_items` và `cart_items` với variant fields
- Thêm indexes cho performance

Để recreate database:
```bash
# Xóa database cũ
rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*

# Tạo lại từ schema
cd backend
wrangler d1 execute DB --local --file=schema.sql
wrangler d1 execute DB --local --file=sample-data.sql
```

## Backend Changes

### 1. Schema Updates (`backend/db/schema.ts`)
- Thêm `productImages` table
- Thêm `productVariants` table
- Cập nhật `orderItems` và `cartItems` với variant fields
- Export types mới: `ProductImage`, `ProductVariant`, `InsertProductImage`, `InsertProductVariant`

### 2. Types Updates (`backend/types/product.ts`)
```typescript
interface ProductVariant {
  id?: string;
  productId?: string;
  size: string;
  stock: number;
  priceAdjustment?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductImage {
  id?: string;
  productId?: string;
  imageUrl: string;
  displayOrder: number;
  createdAt?: string;
}

interface Product {
  // ... existing fields
  variants?: ProductVariant[];
  images?: ProductImage[];
}
```

### 3. Repository Updates (`backend/repositories/product.repository.ts`)
- **New method**: `loadVariantsAndImages()` - Load variants và images cho nhiều products
- **Updated**: `getAll()` - Fetch products kèm variants và images
- **Updated**: `getById()` - Fetch single product kèm variants và images
- **Updated**: `create()` - Insert product kèm variants và images
- **Updated**: `update()` - Update product kèm variants và images (replace strategy)

### 4. Admin Routes (`backend/routes/admin.routes.ts`)
- **New endpoint**: `POST /api/admin/upload`
  - Upload multiple images
  - Store in R2 bucket
  - Return array of URLs
  - Max size: 10MB per image

## Frontend Changes

### 1. Types Updates (`frontend/src/types/product.ts` & `frontend/src/types/order.ts`)
- Added `ProductVariant` and `ProductImage` interfaces
- Updated `Product` interface with variants and images
- Updated `CartItem` and `OrderItem` with variant fields

### 2. Services Updates

**Admin Service** (`frontend/src/services/admin-service.ts`)
- **New method**: `uploadImages(files: File[])`
  - Upload multiple files to R2
  - Returns array of URLs

### 3. Cart Store Updates (`frontend/src/stores/cart.store.ts`)
- **Updated**: `addToCart(product, variant?, quantity)` 
  - Handle variant selection
  - Calculate price with variant adjustment
  - Create unique cart key for product+variant
- **Updated**: `removeFromCart(productId, variantId?)`
- **Updated**: `updateQuantity(productId, quantity, variantId?)`

### 4. Component Updates

#### ProductModal (`frontend/src/components/admin/ProductModal.vue`)
**New Features:**
- Multiple image upload with preview
- Image management (add/remove)
- Variant form (add size, stock, price adjustment)
- Variant list with remove option
- Auto-upload images before saving product
- Enhanced UI with sections for images and variants

**Key Functions:**
- `handleFileSelect()` - Handle file input
- `removeImage()` - Remove new image
- `removeExistingImage()` - Remove existing image
- `addVariant()` - Add new variant
- `removeVariant()` - Remove variant
- `handleSubmit()` - Upload images then save product

#### ProductCard (`frontend/src/components/ProductCard.vue`)
**New Features:**
- Image carousel (multiple images với navigation)
- Variant selector (size buttons)
- Stock status per variant
- Price calculation with variant adjustment
- Image indicators (dots)

**Key Functions:**
- `selectVariant(variant)` - Select product size
- `nextImage()` / `prevImage()` - Navigate images
- Smart stock checking (based on variants if exists)

**UI Elements:**
- Image navigation buttons (prev/next)
- Image indicators (dots)
- Variant selection buttons
- Out of stock indicator per variant

#### CartView (`frontend/src/views/CartView.vue`)
**Updates:**
- Display variant size as tag
- Unique row key for product+variant combo
- Pass variantId to update/remove functions
- Show variant in item title

## How to Use

### Admin: Create Product with Variants and Images

1. Go to Admin Products page
2. Click "Add Product"
3. Fill in basic info (name, price, category, description)
4. **Upload Images:**
   - Click "Choose Images" button
   - Select multiple images
   - Preview appears
   - Can remove unwanted images
5. **Add Variants:**
   - Enter size (e.g., "M", "L", "XL")
   - Enter stock quantity
   - Optionally add price adjustment (e.g., +5000 for XL)
   - Click "Add Variant"
   - Repeat for more sizes
6. Click "Save"
   - Images upload to R2 automatically
   - Product created with variants and images

### Customer: Shop with Variants

1. Browse products
2. View product card:
   - Navigate through images (if multiple)
   - See variant buttons (sizes)
   - Click size button to select
   - Price updates if variant has adjustment
3. Click "Add to Cart"
   - If product has variants, must select size first
   - Warning shown if no size selected
4. Cart shows:
   - Product name with size tag
   - Correct price (base + adjustment)
   - Separate line items for same product with different sizes

## Migration Steps

1. **Stop services**
   ```bash
   ./stop-dev.sh
   ```

2. **Recreate database** (nếu muốn xóa data cũ)
   ```bash
   # Xóa database local
   rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*
   
   # Tạo lại từ schema.sql
   cd backend
   wrangler d1 execute DB --local --file=schema.sql
   wrangler d1 execute DB --local --file=sample-data.sql
   ```

3. **Restart services**
   ```bash
   ./start-dev.sh
   ```

**Note:** Schema đã được cập nhật trực tiếp trong `backend/schema.sql`, không cần file migration riêng.

## API Examples

### Create Product with Variants and Images
```json
POST /api/admin/products
{
  "name": "Premium T-Shirt",
  "description": "High quality cotton t-shirt",
  "price": 200000,
  "category": "snack",
  "inStock": true,
  "variants": [
    { "size": "M", "stock": 50, "priceAdjustment": 0 },
    { "size": "L", "stock": 30, "priceAdjustment": 10000 },
    { "size": "XL", "stock": 20, "priceAdjustment": 20000 }
  ],
  "images": [
    { "imageUrl": "https://r2.../image1.jpg", "displayOrder": 0 },
    { "imageUrl": "https://r2.../image2.jpg", "displayOrder": 1 }
  ]
}
```

### Upload Images
```
POST /api/admin/upload
Content-Type: multipart/form-data

image0: [File]
image1: [File]
image2: [File]
```

Response:
```json
{
  "success": true,
  "urls": [
    "https://api.../api/storage/products/1234-abc.jpg",
    "https://api.../api/storage/products/1234-def.jpg"
  ]
}
```

## Features Summary

✅ Multiple product images with R2 storage
✅ Image carousel on product card
✅ Product variants (sizes) with individual stock
✅ Price adjustments per variant
✅ Variant selection in product card
✅ Variant management in admin panel
✅ Multi-image upload with preview
✅ Cart handling for product+variant combinations
✅ Order tracking with variant information
✅ Database migration script
✅ Full TypeScript type safety

## Notes

- Images are stored in R2 bucket under `products/` folder
- Each variant can have different stock levels
- Variants are optional - products can work without them
- Price adjustment is added to base product price
- Cart treats same product with different variants as separate items
- Migration preserves existing data
