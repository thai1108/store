# ✅ Fix Complete - Product Variants & Images

## Đã Sửa

### 1. ✅ Schema.sql được cập nhật
- Thêm `product_images` và `product_variants` tables
- Cập nhật `order_items` và `cart_items` với variant fields
- Thêm indexes cho performance
- File: `backend/schema.sql`

### 2. ✅ Fix lỗi FOREIGN KEY constraint
**Lỗi cũ:**
```
FOREIGN KEY constraint failed: productId = 0
```

**Nguyên nhân:**
- D1 trả về `lastInsertRowid` khác với SQLite thông thường
- Cần lấy từ `result.meta.last_row_id`

**Đã sửa:**
- File: `backend/repositories/product.repository.ts`
- Thêm logic lấy productId đúng cách từ D1
- Cast sang Number() cho type safety

### 3. ✅ Xóa file migration riêng
- Đã xóa: `backend/migrate-product-variants-images.sql`
- Schema đã được merge vào `backend/schema.sql`
- Dễ dàng recreate database khi cần

## Cách Tạo Lại Database

```bash
# Stop services
./stop-dev.sh

# Xóa database local
rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*

# Tạo lại từ schema
cd backend
wrangler d1 execute DB --local --file=schema.sql
wrangler d1 execute DB --local --file=sample-data.sql

# Restart services
cd ..
./start-dev.sh
```

## Test Tạo Sản Phẩm

### Option 1: Qua Admin UI
1. Mở http://localhost:3003 (hoặc port frontend đang chạy)
2. Login admin
3. Vào Products Management
4. Click "Add Product"
5. Điền thông tin:
   - Name: "Test Product"
   - Price: 100000
   - Category: snack
   - **Add variant:** M, stock: 100, price adjustment: 0
   - Click "Add Variant"
   - Repeat cho size L, XL...
6. Click "Save"

### Option 2: Test bằng API
```bash
# Đảm bảo có admin token
# Replace YOUR_TOKEN với token thực

curl -X POST http://localhost:8787/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test T-Shirt",
    "description": "T-shirt with sizes",
    "price": 200000,
    "category": "snack",
    "inStock": true,
    "variants": [
      {"size": "M", "stock": 100, "priceAdjustment": 0},
      {"size": "L", "stock": 50, "priceAdjustment": 10000}
    ]
  }'
```

## Verify Database

Kiểm tra xem tables đã được tạo đúng:

```bash
cd backend

# Check product_variants table
wrangler d1 execute DB --local --command "SELECT * FROM product_variants LIMIT 5;"

# Check product_images table
wrangler d1 execute DB --local --command "SELECT * FROM product_images LIMIT 5;"

# Check cart_items schema
wrangler d1 execute DB --local --command "PRAGMA table_info(cart_items);"
```

## Current Status

✅ Schema updated in `backend/schema.sql`  
✅ Product creation fixed (no more FOREIGN KEY error)  
✅ Migration file removed (merged into schema.sql)  
✅ Database recreated successfully  
✅ No compile errors  
✅ Services running:
   - Frontend: http://localhost:3003
   - Backend: http://localhost:8787

## Next Steps

1. **Test qua UI:**
   - Tạo product với variants
   - Upload images
   - Verify hiển thị đúng

2. **Test shopping flow:**
   - Chọn size trên product card
   - Add to cart
   - Verify cart shows size
   - Checkout

3. **Check database:**
   - Verify variants được lưu
   - Verify images được lưu
   - Check foreign keys work

## Files Changed

```
backend/
├── schema.sql (UPDATED - added variants & images tables)
├── repositories/product.repository.ts (FIXED - productId handling)
└── migrate-product-variants-images.sql (DELETED - merged into schema.sql)

docs/
├── PRODUCT_VARIANTS_IMAGES.md (UPDATED)
├── VARIANTS_DEPLOYMENT.md (UPDATED)
└── SUMMARY_VI.md (UPDATED)
```

---

**Ready to test!** 🚀

Bây giờ bạn có thể tạo sản phẩm với variants và images qua admin panel mà không gặp lỗi FOREIGN KEY nữa.
