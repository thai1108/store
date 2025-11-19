# Admin Variant & Stock Display Enhancement

## Thay đổi đã thực hiện

### 1. Product Management - Hiển thị Variants & Stock

**File**: `frontend/src/components/admin/ProductTable.vue`

#### Thêm cột Variants
- ✅ Hiển thị tất cả variants của sản phẩm
- ✅ Hiển thị stock cho từng variant
- ✅ Color coding cho stock level:
  - 🟢 **Xanh lá**: Stock > 10 (đủ hàng)
  - 🟠 **Cam**: Stock < 10 (sắp hết)
  - 🔴 **Đỏ**: Stock = 0 (hết hàng)
- ✅ Hiển thị giá cuối cùng = Base Price + Price Adjustment
- ✅ Hiển thị price adjustment riêng biệt

#### Visual Design
```
┌─────────────────────────────────────┐
│ Size: M                             │
│ Stock: 25 (màu xanh)                │
│ 50,000₫ (+5,000₫)                   │
├─────────────────────────────────────┤
│ Size: L                             │
│ Stock: 8 (màu cam - low stock)      │
│ 55,000₫ (+10,000₫)                  │
├─────────────────────────────────────┤
│ Size: XL                            │
│ Stock: 0 (màu đỏ - out of stock)    │
│ 60,000₫ (+15,000₫)                  │
└─────────────────────────────────────┘
```

### 2. Order Management - Hiển thị Variant Info

**File**: `frontend/src/components/admin/OrderModal.vue`

#### Thêm cột Variant trong Order Items
- ✅ Hiển thị variant size khi có
- ✅ Badge styling cho variant
- ✅ Hiển thị "-" khi không có variant

#### Visual trong Order Details
```
┌──────────────────────────────────────────────────────────┐
│ Product Name  │ Variant │ Quantity │ Price     │ Total   │
├──────────────────────────────────────────────────────────┤
│ Trà Sữa       │   M     │    2     │ 50,000₫   │100,000₫ │
│ Snack A       │   -     │    1     │ 25,000₫   │ 25,000₫ │
└──────────────────────────────────────────────────────────┘
```

### 3. Translations

**Files**: 
- `frontend/src/locales/vi.ts`
- `frontend/src/locales/en.ts`

Thêm keys mới:
```typescript
admin: {
  productManagement: {
    variants: 'Biến thể' / 'Variants',
  },
  orderManagement: {
    variant: 'Biến thể' / 'Variant',
  }
}
```

## Tính năng chính

### 1. Stock Management Display
- **Real-time stock levels**: Hiển thị stock chính xác cho từng variant
- **Visual indicators**: Màu sắc giúp admin nhanh chóng nhận biết tình trạng hàng
- **Low stock warning**: Cảnh báo khi stock < 10

### 2. Price Calculation Display
- **Base price**: Giá gốc của product
- **Price adjustment**: Thêm giá cho variant lớn hơn
- **Total price**: Hiển thị giá cuối cùng = base + adjustment
- **Clear formula**: `getTotalPrice(basePrice, priceAdjustment)`

### 3. Order Tracking
- **Variant info preserved**: Đơn hàng lưu thông tin variant
- **Historical data**: Có thể xem lại size nào đã được order
- **Price at order time**: Giá được lưu tại thời điểm đặt hàng

## Code Examples

### Tính giá variant trong Product Table
```typescript
const getTotalPrice = (basePrice: number, priceAdjustment?: number) => {
  return basePrice + (priceAdjustment || 0);
};

// Sử dụng:
formatPrice(getTotalPrice(product.price, variant.priceAdjustment))
// Output: "50,000₫" nếu base=45000, adjustment=5000
```

### Hiển thị stock với color coding
```vue
<span 
  class="variant-stock" 
  :class="{ 
    'low-stock': variant.stock < 10, 
    'out-of-stock': variant.stock === 0 
  }"
>
  Stock: {{ variant.stock }}
</span>
```

### CSS cho stock colors
```css
.variant-stock {
  color: #38a169; /* Green - default */
}

.variant-stock.low-stock {
  color: #ed8936; /* Orange - warning */
}

.variant-stock.out-of-stock {
  color: #e53e3e; /* Red - critical */
  font-weight: 600;
}
```

## Benefits cho Admin

### 1. Inventory Management
✅ Nhanh chóng xem stock của tất cả variants
✅ Nhận diện variants cần nhập hàng (màu cam/đỏ)
✅ Theo dõi tình trạng hàng hóa real-time

### 2. Price Management
✅ Xem giá cuối cùng cho mỗi variant
✅ So sánh price adjustments giữa các sizes
✅ Hiểu rõ cấu trúc giá sản phẩm

### 3. Order Fulfillment
✅ Biết chính xác size nào khách đã order
✅ Kiểm tra nhanh thông tin đơn hàng
✅ Đảm bảo giao đúng variant

## Testing Checklist

### Product Management Page
- [ ] Hiển thị variants cho products có variants
- [ ] Hiển thị "-" cho products không có variants
- [ ] Stock colors đúng (xanh/cam/đỏ)
- [ ] Giá hiển thị đúng (base + adjustment)
- [ ] Responsive trên mobile

### Order Details Modal
- [ ] Hiển thị variant size trong order
- [ ] Badge styling đẹp
- [ ] Tính tổng đúng
- [ ] Hiển thị "-" khi không có variant

### Translations
- [ ] Tiếng Việt hiển thị đúng
- [ ] English hiển thị đúng
- [ ] Không có missing translation keys

## Screenshots Flow

### 1. Product List với Variants
```
Product Name  │ Category │ Base Price │ Variants              │ Status
─────────────────────────────────────────────────────────────────────
Trà Sữa      │ Milk Tea │  45,000₫   │ M: 25 (50,000₫)      │ ✓ Còn hàng
             │          │            │ L: 8 (55,000₫)       │
             │          │            │ XL: 0 (60,000₫)      │
─────────────────────────────────────────────────────────────────────
Snack A      │ Snacks   │  25,000₫   │ -                    │ ✓ Còn hàng
```

### 2. Order Details với Variant
```
Chi tiết đơn hàng #123

Items:
┌──────────────────────────────────────────────────┐
│ Trà Sữa          │  M  │ x2 │ 50,000₫ │ 100,000₫ │
│ Snack A          │  -  │ x1 │ 25,000₫ │  25,000₫ │
├──────────────────────────────────────────────────┤
│                        Tổng cộng │     125,000₫ │
└──────────────────────────────────────────────────┘
```

## Files Changed

- ✅ `frontend/src/components/admin/ProductTable.vue`
- ✅ `frontend/src/components/admin/OrderModal.vue`
- ✅ `frontend/src/locales/vi.ts`
- ✅ `frontend/src/locales/en.ts`
- ✅ `ADMIN_VARIANT_STOCK_DISPLAY.md` (this file)

## Deployment

```bash
cd frontend
npm run build
# Deploy to Cloudflare Pages
```

## Next Steps

Các tính năng có thể thêm sau:
1. Filter products by stock level (low stock only)
2. Bulk stock update cho variants
3. Stock history tracking
4. Auto-notify khi stock < threshold
5. Export stock report
