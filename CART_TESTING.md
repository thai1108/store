# Cart Persistence - Quick Testing Guide

## 🧪 Test Scenarios

### ✅ Scenario 1: Guest User Cart Persistence
**Objective:** Verify cart persists in localStorage for non-logged-in users

**Steps:**
1. Open app in incognito/private window
2. Browse products and add 2-3 items to cart
3. Check cart page - items should be visible
4. **Refresh the page** (Ctrl+R / Cmd+R)
5. ✅ **Expected:** Cart items still present

**Validation:**
- Open DevTools → Application/Storage → LocalStorage
- Check for `cart-items` key
- Value should be JSON array of cart items

---

### ✅ Scenario 2: Authenticated User Cart Sync
**Objective:** Verify cart syncs to server for logged-in users

**Steps:**
1. Login with test account
2. Add 2-3 items to cart
3. Open DevTools Network tab
4. Add another item
5. Look for POST request to `/api/cart/:userId`
6. **Refresh the page**
7. ✅ **Expected:** Cart items still present

**Validation:**
- Check Network tab for:
  - POST `/api/cart/:userId` (save cart)
  - GET `/api/cart/:userId` (load cart)
- Database should have records in `cart_items` table

---

### ✅ Scenario 3: Guest → Login Merge
**Objective:** Verify carts merge when guest logs in

**Setup:**
1. Create test account and add Item A, Item B via API/database
2. Logout

**Steps:**
1. As guest, add Item C, Item D to cart
2. Check cart - should show C, D (2 items)
3. **Login with the test account**
4. ✅ **Expected:** Cart shows A, B, C, D (4 items)

**Edge Case - Same Product:**
1. Server has: Product X (qty: 2)
2. Guest adds: Product X (qty: 3)
3. After login: Product X should have qty: 3 (higher value)

---

### ✅ Scenario 4: Login → Logout → Guest
**Objective:** Verify cart behavior across authentication states

**Steps:**
1. Login and add items A, B, C
2. **Logout**
3. Cart should be empty (cleared on logout)
4. As guest, add items D, E
5. Check localStorage - should have D, E
6. **Login again**
7. ✅ **Expected:** Cart has A, B, C, D, E (merged)

---

### ✅ Scenario 5: Multiple Device Sync
**Objective:** Verify cart syncs across devices for logged-in users

**Steps:**
1. Device 1: Login, add items X, Y
2. Device 2: Login with same account
3. ✅ **Expected:** Cart shows X, Y
4. Device 2: Add item Z
5. Device 1: Refresh page
6. ✅ **Expected:** Cart shows X, Y, Z

---

### ✅ Scenario 6: Cart Persistence After Browser Close
**Objective:** Verify cart persists after closing browser

**For Guest:**
1. Add items to cart
2. Close browser completely
3. Reopen browser and navigate to app
4. ✅ **Expected:** Cart items still present (localStorage)

**For Authenticated User:**
1. Login and add items
2. Close browser completely
3. Reopen browser and navigate to app
4. Will need to login again
5. ✅ **Expected:** Cart items restored from server

---

## 🔍 Debug Checklist

### If cart NOT persisting for guests:
- [ ] Check browser console for errors
- [ ] Verify localStorage is enabled (not in strict private mode)
- [ ] Check `cart-items` key in DevTools → Application → LocalStorage
- [ ] Verify cart store `watch()` is triggering

### If cart NOT syncing for authenticated users:
- [ ] Check Network tab for API calls
- [ ] Verify auth token is being sent in headers
- [ ] Check API response status (should be 200)
- [ ] Verify `cart_items` table exists in database
- [ ] Check backend logs for errors

### If merge NOT working:
- [ ] Verify guest has items in localStorage before login
- [ ] Check login process calls `syncWithServer()`
- [ ] Verify merge logic in cart store
- [ ] Check both local and server items exist before merge
- [ ] Review merge algorithm (max quantity logic)

---

## 📊 Expected API Calls

### On Page Load (Authenticated):
```
GET /api/cart/:userId
Authorization: Bearer <token>
```

### On Add/Update/Remove Item:
```
POST /api/cart/:userId
Authorization: Bearer <token>
Content-Type: application/json
Body: { items: [...] }
```

### On Login:
```
POST /api/users/login
Body: { email, password }

Then immediately:
GET /api/cart/:userId (load server cart)
POST /api/cart/:userId (save merged cart)
```

### On Logout:
```
POST /api/cart/:userId (save current cart)

Then:
- Clear cart state
- Reload from localStorage
```

---

## 🛠️ Manual Testing Commands

### Check localStorage:
```javascript
// In browser console
localStorage.getItem('cart-items')
JSON.parse(localStorage.getItem('cart-items'))
```

### Clear localStorage:
```javascript
localStorage.removeItem('cart-items')
```

### Simulate cart data:
```javascript
const testCart = [
  {
    productId: "1",
    productName: "Test Product",
    quantity: 2,
    price: 50000,
    imageUrl: "https://..."
  }
];
localStorage.setItem('cart-items', JSON.stringify(testCart));
// Refresh page
```

### Check API directly:
```bash
# Get cart
curl -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/cart/<userId>

# Save cart
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[...]}' \
  http://localhost:8787/api/cart/<userId>
```

---

## ✅ Success Criteria

| Test | Guest | Authenticated | Status |
|------|-------|---------------|--------|
| Add to cart | ✅ localStorage | ✅ localStorage + server | |
| Refresh page | ✅ persists | ✅ persists | |
| Close/reopen browser | ✅ persists | ✅ persists (after login) | |
| Login with cart | N/A | ✅ merges | |
| Logout | ✅ clears, uses localStorage | ✅ saves to server first | |
| Multiple devices | N/A | ✅ syncs | |

---

## 🚨 Common Issues

### Issue: "Cart cleared on refresh"
**Cause:** localStorage not saving  
**Fix:** Check `saveToLocalStorage()` is being called in watch

### Issue: "API 401 Unauthorized"
**Cause:** Token expired or invalid  
**Fix:** Re-login to get fresh token

### Issue: "Duplicate items after login"
**Cause:** Merge logic not working  
**Fix:** Check `mergeWithServerCart()` logic

### Issue: "Cart not updating in UI"
**Cause:** Reactivity not triggering  
**Fix:** Ensure using `.value` for refs, deep watch enabled

---

**Last Updated:** November 15, 2025  
**Quick Reference:** See `CART_PERSISTENCE.md` for full implementation details
