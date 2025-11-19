# Checkout Variant Fix & Variant Price Tracking

## Vấn đề đã fix

### 1. Client không gửi variantId khi checkout ❌
**Trước:**
```typescript
// CheckoutView.vue - THIẾU variantId
items: cartStore.items.map((item) => ({
  productId: item.productId,
  quantity: item.quantity,  // ❌ Không có variantId
}))
```

**Sau:**
```typescript
// CheckoutView.vue - ĐÃ FIX
items: cartStore.items.map((item) => ({
  productId: item.productId,
  variantId: item.variantId,  // ✅ Gửi variantId
  quantity: item.quantity,
}))
```

### 2. Backend không lưu được variant price riêng ❌
**Trước:** Chỉ lưu `price` (giá cuối cùng)
**Sau:** Lưu cả `price` VÀ `variantPrice` để tracking tốt hơn

## Thay đổi chi tiết

### Frontend Changes

#### 1. CheckoutView.vue - Gửi variantId
```typescript
const orderData = {
  items: cartStore.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId, // ✅ ADDED
    quantity: item.quantity,
  })),
  customerInfo: { ... },
  notes: form.value.notes || undefined,
};
```

#### 2. CheckoutView.vue - Hiển thị variant trong Order Summary
```vue
<h4>
  {{ item.productName }}
  <span v-if="item.variantSize" class="variant-badge">
    {{ item.variantSize }}  <!-- M, L, XL -->
  </span>
</h4>
```

**Visual Example:**
```
┌──────────────────────────────┐
│ Trà Sữa [M]                  │
│ 50,000₫ × 2                  │
│                    100,000₫  │
└──────────────────────────────┘
```

### Backend Changes

#### 1. Schema Update - Thêm variantPrice
**File:** `backend/db/schema.ts`

```typescript
export const orderItems = sqliteTable('order_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer('orderId', { mode: 'number' }).notNull(),
  productId: integer('productId', { mode: 'number' }).notNull(),
  productName: text('productName').notNull(),
  variantId: integer('variantId', { mode: 'number' }),
  variantSize: text('variantSize'),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  variantPrice: real('variantPrice'), // ✅ NEW: Giá variant riêng
});
```

#### 2. Repository Update - Lưu variantPrice
**File:** `backend/repositories/order.repository.ts`

```typescript
let variantPrice: number | null = null;

if (item.variantId) {
  // ... validate variant ...
  
  finalPrice = product[0].price + (variant[0].priceAdjustment || 0);
  variantPrice = finalPrice; // ✅ Lưu giá variant để tracking
  variantId = variant[0].id;
  variantSize = variant[0].size;
}

const orderItem = {
  productId: Number(item.productId),
  productName: product[0].name,
  variantId,
  variantSize,
  variantPrice, // ✅ Lưu vào DB
  quantity: item.quantity,
  price: finalPrice,
};
```

#### 3. Migration SQL
**File:** `backend/migrate-variant-price.sql`

```sql
ALTER TABLE order_items ADD COLUMN variantPrice REAL;
```

## Data Structure

### Order Items với Variant
```
┌────────────────────────────────────────────────────────┐
│ Order Item #1                                          │
├────────────────────────────────────────────────────────┤
│ productId: 1                                           │
│ productName: "Trà Sữa"                                 │
│ variantId: 5            ✅ Được lưu                    │
│ variantSize: "M"        ✅ Được lưu                    │
│ variantPrice: 50000     ✅ Giá variant riêng (NEW)    │
│ price: 50000            ✅ Giá cuối cùng              │
│ quantity: 2                                            │
└────────────────────────────────────────────────────────┘
```

### So sánh Base Product vs Variant Order

**Base Product (không có variant):**
```json
{
  "productId": "2",
  "productName": "Snack A",
  "variantId": null,
  "variantSize": null,
  "variantPrice": null,
  "price": 25000,        // Giá base
  "quantity": 1
}
```

**Variant Order:**
```json
{
  "productId": "1",
  "productName": "Trà Sữa",
  "variantId": "5",
  "variantSize": "M",
  "variantPrice": 50000,  // Base (45K) + Adjustment (5K)
  "price": 50000,         // Same as variantPrice
  "quantity": 2
}
```

## Benefits của variantPrice

### 1. Historical Price Tracking
```sql
-- Xem giá variant lúc order
SELECT 
  productName,
  variantSize,
  variantPrice,
  price,
  createdAt
FROM order_items
WHERE variantId IS NOT NULL
ORDER BY createdAt DESC;
```

### 2. Price Change Analysis
```sql
-- So sánh giá variant hiện tại vs lúc order
SELECT 
  oi.productName,
  oi.variantSize,
  oi.variantPrice as price_at_order_time,
  (p.price + pv.priceAdjustment) as current_price,
  ((p.price + pv.priceAdjustment) - oi.variantPrice) as price_diff
FROM order_items oi
JOIN product_variants pv ON oi.variantId = pv.id
JOIN products p ON oi.productId = p.id
WHERE oi.variantId IS NOT NULL;
```

### 3. Revenue Analysis by Variant
```sql
-- Doanh thu theo từng size
SELECT 
  variantSize,
  COUNT(*) as orders_count,
  SUM(quantity) as total_quantity,
  SUM(variantPrice * quantity) as total_revenue
FROM order_items
WHERE variantId IS NOT NULL
GROUP BY variantSize
ORDER BY total_revenue DESC;
```

## Testing Scenarios

### Test Case 1: Order với variant
1. Thêm product có variant vào cart (chọn size M)
2. Vào checkout
3. ✅ Verify: Order summary hiển thị "[M]" badge
4. Đặt hàng
5. ✅ Verify: Backend lưu variantId = 5
6. ✅ Verify: Backend lưu variantSize = "M"
7. ✅ Verify: Backend lưu variantPrice = 50000

### Test Case 2: Order không có variant
1. Thêm product không có variant vào cart
2. Vào checkout
3. ✅ Verify: Không hiển thị variant badge
4. Đặt hàng
5. ✅ Verify: variantId = NULL
6. ✅ Verify: variantSize = NULL
7. ✅ Verify: variantPrice = NULL
8. ✅ Verify: price = base product price

### Test Case 3: Mixed cart (variant + non-variant)
1. Thêm cả product có variant và không có variant
2. Checkout
3. ✅ Verify: Hiển thị đúng variant badge cho từng item
4. Đặt hàng
5. ✅ Verify: Các item có variant lưu đầy đủ thông tin
6. ✅ Verify: Các item không có variant có NULL variant fields

## Deployment Steps

### 1. Apply Migration
```bash
./apply-variant-price-migration.sh
```

### 2. Deploy Backend
```bash
cd backend
npm run deploy
```

### 3. Deploy Frontend
```bash
cd frontend
npm run build
# Deploy to Cloudflare Pages
```

### 4. Verify
```bash
# Test order với variant
# Check database
wrangler d1 execute store-db --remote \
  --command "SELECT * FROM order_items WHERE variantId IS NOT NULL LIMIT 5"
```

## Files Changed

### Frontend
- ✅ `frontend/src/views/CheckoutView.vue`
  - Gửi variantId trong orderData
  - Hiển thị variant badge trong order summary

### Backend
- ✅ `backend/db/schema.ts`
  - Thêm variantPrice column
- ✅ `backend/repositories/order.repository.ts`
  - Tính và lưu variantPrice
- ✅ `backend/migrate-variant-price.sql`
  - Migration script
- ✅ `apply-variant-price-migration.sh`
  - Script chạy migration

### Documentation
- ✅ `CHECKOUT_VARIANT_FIX.md` (this file)

## Summary

| Feature | Before ❌ | After ✅ |
|---------|-----------|----------|
| Client gửi variantId | ❌ Không | ✅ Có |
| Backend lưu variantId | ⚠️ Có nhưng NULL | ✅ Lưu đúng |
| Lưu variantPrice riêng | ❌ Không | ✅ Có |
| Hiển thị variant trong checkout | ❌ Không | ✅ Badge đẹp |
| Tracking variant sales | ❌ Khó | ✅ Dễ dàng |
| Price history analysis | ❌ Không thể | ✅ Có thể |

## Next Steps

Có thể thêm sau:
1. Admin dashboard: Variant sales report
2. API endpoint: Get variant price history
3. Frontend: Show variant in order history
4. Export: Variant sales CSV report
5. Analytics: Best selling variant sizes
