# Order Variant Security Fix

## Vấn đề

Hệ thống đặt hàng có lỗ hổng bảo mật nghiêm trọng:
- ❌ Không lưu thông tin variant khi checkout
- ❌ Tin tưởng giá từ client thay vì validate từ database
- ❌ Không kiểm tra stock của variant
- ❌ Dễ bị hack giá bằng cách thay đổi request

## Giải pháp đã implement

### 1. Cập nhật Types (`backend/types/order.ts`)

Thêm support cho variant trong OrderItem:
```typescript
export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;      // ✅ THÊM MỚI
  variantSize?: string;    // ✅ THÊM MỚI
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;    // ✅ THÊM MỚI
    quantity: number;
  }>;
  customerInfo: CustomerInfo;
  notes?: string;
  userId?: string;
}
```

### 2. Security Validation (`backend/repositories/order.repository.ts`)

Thêm validation toàn diện khi tạo order:

#### 🔒 Anti-Hack Measures:

1. **Validate Product từ Database**
   ```typescript
   const product = await db.select()
     .from(schema.products)
     .where(eq(schema.products.id, Number(item.productId)))
     .limit(1);
   
   if (!product[0]) {
     throw new Error(`Product with ID ${item.productId} not found`);
   }
   ```

2. **Kiểm tra Stock**
   ```typescript
   if (!product[0].inStock) {
     throw new Error(`Product "${product[0].name}" is out of stock`);
   }
   ```

3. **Validate Variant Ownership**
   ```typescript
   if (variant[0].productId !== product[0].id) {
     throw new Error(`Variant ${item.variantId} does not belong to product ${item.productId}`);
   }
   ```

4. **Kiểm tra Variant Stock**
   ```typescript
   if (variant[0].stock < item.quantity) {
     throw new Error(`Variant "${variant[0].size}" only has ${variant[0].stock} items in stock`);
   }
   ```

5. **Tính Giá từ Database (KHÔNG TIN CLIENT)**
   ```typescript
   // GIÁ ĐƯỢC LẤY TỪ DATABASE, KHÔNG PHẢI TỪ CLIENT
   finalPrice = product[0].price + (variant[0].priceAdjustment || 0);
   ```

6. **Giảm Stock Tự động**
   ```typescript
   await db.update(schema.productVariants)
     .set({ 
       stock: variant[0].stock - item.quantity,
       updatedAt: now,
     })
     .where(eq(schema.productVariants.id, variant[0].id));
   ```

### 3. Database Migration

**File**: `backend/migrate-order-items-variant.sql`

Thêm 2 columns mới vào `order_items`:
```sql
ALTER TABLE order_items ADD COLUMN variantId INTEGER;
ALTER TABLE order_items ADD COLUMN variantSize TEXT;
```

**Script**: `apply-order-variant-migration.sh`
```bash
./apply-order-variant-migration.sh
```

## Cách hoạt động

### Trước đây (KHÔNG AN TOÀN):
```
Client gửi: { productId: 1, price: 50000, quantity: 2 }
             ↓
Backend tin tưởng giá từ client → LƯU VÀO DB
```
👉 **Hacker có thể sửa price thành 1 đồng!**

### Bây giờ (AN TOÀN):
```
Client gửi: { productId: 1, variantId: 5, quantity: 2 }
             ↓
Backend:
  1. Query product từ DB → basePrice = 45000
  2. Query variant từ DB → priceAdjustment = 5000
  3. Validate variant thuộc product
  4. Kiểm tra stock >= quantity
  5. Tính finalPrice = 45000 + 5000 = 50000
  6. Giảm variant.stock
  7. Lưu order với giá từ DB
```
👉 **Client KHÔNG THỂ hack giá!**

## Testing Flow

### Test Case 1: Order với variant hợp lệ
```json
POST /api/orders
{
  "items": [{
    "productId": "1",
    "variantId": "5",
    "quantity": 2
  }],
  "customerInfo": {
    "name": "Test User",
    "phone": "0123456789"
  }
}
```
✅ Expected: Order được tạo với giá từ DB

### Test Case 2: Hack giá (thử gửi giá fake)
```json
// Client cố gắng gửi giá fake
POST /api/orders
{
  "items": [{
    "productId": "1",
    "variantId": "5",
    "quantity": 2,
    "price": 1  // ← FAKE PRICE
  }]
}
```
✅ Expected: Backend IGNORE giá từ client, dùng giá từ DB

### Test Case 3: Variant không thuộc product
```json
POST /api/orders
{
  "items": [{
    "productId": "1",
    "variantId": "999",  // ← Variant của product khác
    "quantity": 1
  }]
}
```
❌ Expected: Error "Variant does not belong to product"

### Test Case 4: Không đủ stock
```json
POST /api/orders
{
  "items": [{
    "productId": "1",
    "variantId": "5",
    "quantity": 9999  // ← Quá nhiều
  }]
}
```
❌ Expected: Error "only has X items in stock"

## Deployment Steps

1. **Apply Migration**
   ```bash
   ./apply-order-variant-migration.sh
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   npm run deploy
   ```

3. **Verify**
   - Tạo order với variant
   - Kiểm tra variant info được lưu
   - Test hack giá (phải fail)
   - Kiểm tra stock giảm tự động

## Lợi ích

✅ **Bảo mật**: Không thể hack giá
✅ **Toàn vẹn dữ liệu**: Lưu đầy đủ thông tin variant
✅ **Tự động quản lý stock**: Giảm stock khi order
✅ **Validate chặt chẽ**: Kiểm tra ownership, stock, product status
✅ **Anti-tampering**: Tất cả giá trị quan trọng lấy từ DB

## Files Changed

- ✅ `backend/types/order.ts` - Thêm variant fields
- ✅ `backend/repositories/order.repository.ts` - Security validation logic
- ✅ `backend/migrate-order-items-variant.sql` - Database migration
- ✅ `apply-order-variant-migration.sh` - Migration script
- ✅ `ORDER_VARIANT_SECURITY_FIX.md` - Documentation này

## Notes

- Giá LUÔN được tính từ database, KHÔNG BAO GIỜ tin client
- Variant stock được giảm tự động khi order thành công
- Old orders không có variant vẫn hoạt động bình thường (columns nullable)
- Tất cả validations throw error rõ ràng để dễ debug
