# Cart Persistence Implementation

## Overview
Implemented cart persistence functionality to prevent data loss on page reload:
- **Guest users**: Cart stored in localStorage
- **Authenticated users**: Cart synced to database
- **Merge logic**: When guest logs in, local cart merges with server cart

## Changes Made

### Backend Changes

#### 1. Database Schema (`backend/schema.sql`)
Added new `cart_items` table:
```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  imageUrl TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id),
  FOREIGN KEY (productId) REFERENCES products (id),
  UNIQUE(userId, productId)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_userid ON cart_items (userId);
```

#### 2. Types (`backend/types/order.ts`)
Added `CartItem` interface:
```typescript
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}
```

#### 3. Cart Repository (`backend/repositories/cart.repository.ts`)
New repository for cart operations:
- `getByUserId(userId)`: Get user's cart
- `saveCart(userId, items)`: Save entire cart
- `clearCart(userId)`: Clear user's cart
- `addItem(userId, item)`: Add single item
- `updateItemQuantity(userId, productId, quantity)`: Update quantity
- `removeItem(userId, productId)`: Remove item

#### 4. Cart Routes (`backend/routes/cart.routes.ts`)
New API endpoints:
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/:userId` - Save/update cart
- `DELETE /api/cart/:userId` - Clear cart

All endpoints require authentication and verify user ownership.

#### 5. Main Router (`backend/index.ts`)
Added cart router to handle `/api/cart/*` requests.

### Frontend Changes

#### 1. Cart Store (`frontend/src/stores/cart.store.ts`)
Enhanced with persistence logic:

**New Features:**
- Auto-load from localStorage on initialization
- Auto-save to localStorage on every change
- Auto-sync with server for authenticated users
- Merge logic when logging in with existing local cart

**New Methods:**
- `loadFromLocalStorage()`: Load cart from localStorage
- `saveToLocalStorage()`: Save cart to localStorage
- `loadFromServer(userId)`: Load cart from server
- `saveToServer(userId)`: Save cart to server
- `syncWithServer(userId)`: Merge and sync carts
- `setUserId(userId)`: Track current user

**Key Logic:**
```typescript
// Watch for changes
watch(items, () => {
  if (isLoadedFromStorage.value) {
    saveToLocalStorage();
    
    // Also save to server if user is authenticated
    if (currentUserId.value) {
      saveToServer(currentUserId.value).catch(console.error);
    }
  }
}, { deep: true });
```

**Merge Logic:**
```typescript
const mergeWithServerCart = (serverItems: CartItem[]) => {
  const merged = [...items.value];
  
  for (const serverItem of serverItems) {
    const existingIndex = merged.findIndex(
      (item) => item.productId === serverItem.productId
    );
    
    if (existingIndex >= 0) {
      // Keep the higher quantity
      merged[existingIndex].quantity = Math.max(
        merged[existingIndex].quantity,
        serverItem.quantity
      );
    } else {
      // Add new item from server
      merged.push(serverItem);
    }
  }
  
  items.value = merged;
};
```

#### 2. Auth Store (`frontend/src/stores/auth.store.ts`)
Enhanced to trigger cart sync:

**On Login/Register:**
```typescript
// Sync cart after successful login
const cartStore = useCartStore();
await cartStore.syncWithServer(response.user.id);
```

**On Logout:**
```typescript
// Save cart to server before logout
if (user.value && cartStore.items.length > 0) {
  cartStore.saveToServer(user.value.id).catch(console.error);
}

// Clear and reload from localStorage
cartStore.setUserId(null);
cartStore.clearCart();
cartStore.loadFromLocalStorage();
```

## User Flows

### Flow 1: Guest User
1. User adds items to cart → Saved to localStorage
2. User refreshes page → Cart loaded from localStorage
3. Items persist across sessions

### Flow 2: Authenticated User
1. User logs in → Cart synced with server
2. User adds items → Saved to both localStorage and server
3. User refreshes → Cart loaded from localStorage initially
4. On page load, if authenticated → Syncs with server

### Flow 3: Guest → Login
1. Guest adds items A, B to cart (localStorage)
2. Guest logs in
3. Server has items C, D from previous session
4. **Merge Logic:**
   - Items A, B, C, D all present
   - If same item exists in both, keep higher quantity
5. Merged cart saved to server
6. localStorage cleared (now using server)

### Flow 4: Login → Logout → Guest
1. User with items in cart logs out
2. Cart saved to server before logout
3. Cart cleared on frontend
4. localStorage reloaded (empty for new session)
5. User adds new items → Saved to localStorage
6. When user logs in again → Merges with saved server cart

## API Endpoints

### GET /api/cart/:userId
Get user's cart from database.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "123",
        "productName": "Product Name",
        "quantity": 2,
        "price": 50000,
        "imageUrl": "https://..."
      }
    ]
  }
}
```

### POST /api/cart/:userId
Save/update entire cart.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": "123",
      "productName": "Product Name",
      "quantity": 2,
      "price": 50000,
      "imageUrl": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart saved successfully"
}
```

### DELETE /api/cart/:userId
Clear user's cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

## Deployment Steps

### 1. Apply Database Schema
If using Cloudflare D1:
```bash
cd backend
wrangler d1 execute <DATABASE_NAME> --file=schema.sql
```

Or manually run the SQL commands from `schema.sql` to create the `cart_items` table.

### 2. Deploy Backend
```bash
cd backend
npm run deploy
```

### 3. Test
1. **Test as guest:**
   - Add items to cart
   - Refresh page
   - Verify items persist

2. **Test as authenticated user:**
   - Login
   - Add items
   - Refresh page
   - Verify items persist
   - Check database for cart_items records

3. **Test merge logic:**
   - Logout
   - Add items as guest
   - Login with different account that has existing cart
   - Verify both carts merged correctly

## localStorage Keys

- `cart-items`: Array of CartItem objects
- Format: `JSON.stringify(CartItem[])`

## Security Notes

1. **Authentication Required**: All cart API endpoints require valid JWT token
2. **User Ownership**: Each endpoint verifies userId matches token
3. **Data Validation**: Server validates cart items structure
4. **SQL Injection Protection**: Using parameterized queries
5. **Unique Constraint**: One cart entry per user per product

## Performance Considerations

1. **Batch Operations**: Cart save uses D1 batch for multiple items
2. **Debouncing**: Consider adding debounce to reduce server calls
3. **Optimistic Updates**: UI updates immediately, server sync in background
4. **Error Handling**: Failed server saves don't affect localStorage

## Future Enhancements

1. **Cart Expiration**: Add TTL for old cart items
2. **Conflict Resolution**: More sophisticated merge strategies
3. **Cart History**: Track cart changes over time
4. **Abandoned Cart**: Notifications for items left in cart
5. **Price Updates**: Check for price changes when loading cart
6. **Stock Validation**: Verify items still in stock

## Troubleshooting

### Cart not persisting for guests
- Check browser localStorage is enabled
- Check console for localStorage errors
- Verify `cart-items` key exists in localStorage

### Cart not syncing for authenticated users
- Verify API endpoints are working (check network tab)
- Check authentication token is valid
- Verify cart_items table exists in database
- Check server logs for errors

### Cart items lost after login
- Check syncWithServer is being called
- Verify merge logic is working correctly
- Check both localStorage and server have data before merge

### Duplicate items in cart
- Check unique constraint on userId + productId
- Verify merge logic uses correct product ID comparison
- Check for race conditions in concurrent requests

---

**Implementation Date:** November 15, 2025  
**Status:** ✅ Complete  
**Version:** 1.0
