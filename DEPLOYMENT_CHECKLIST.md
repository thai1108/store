# 🚀 Deployment Checklist - Cart Persistence

## Pre-Deployment

- [ ] Code review completed
- [ ] All TypeScript errors resolved
- [ ] Documentation reviewed
- [ ] Test scenarios planned

---

## Database Setup

### Option 1: Cloudflare D1 (Recommended)

```bash
# Navigate to backend
cd backend

# Execute schema updates
wrangler d1 execute YOUR_DATABASE_NAME --file=schema.sql

# Verify table created
wrangler d1 execute YOUR_DATABASE_NAME --command="SELECT name FROM sqlite_master WHERE type='table' AND name='cart_items'"
```

Expected output: `cart_items` table exists

### Option 2: Local Development

```bash
# If using local SQLite for dev
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite < schema.sql

# Verify
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT * FROM cart_items"
```

---

## Backend Deployment

```bash
cd backend

# Install dependencies (if needed)
npm install

# Build
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Or using wrangler directly
wrangler deploy
```

**Verify deployment:**
```bash
# Test health endpoint
curl https://your-worker.workers.dev/api/health

# Should return:
# {"success":true,"message":"Store API is healthy","timestamp":"..."}
```

---

## Frontend Deployment

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to your hosting (Cloudflare Pages, Vercel, etc.)
# Example for Cloudflare Pages:
wrangler pages publish dist
```

---

## Post-Deployment Testing

### 1. Test Guest Cart (localStorage)

- [ ] Open app in incognito window
- [ ] Add 2-3 items to cart
- [ ] Refresh page
- [ ] ✅ Items should persist

**Debug if fails:**
- Check browser console for errors
- Verify localStorage in DevTools
- Check `cart-items` key exists

### 2. Test Authenticated Cart (Database)

- [ ] Create test account or login
- [ ] Add items to cart
- [ ] Open Network tab in DevTools
- [ ] Verify POST to `/api/cart/:userId`
- [ ] Refresh page
- [ ] ✅ Items should persist

**Debug if fails:**
- Check API response status (should be 200)
- Verify auth token in request headers
- Check backend logs for errors
- Query database for cart_items records

### 3. Test Merge Logic

**Setup:**
- Have account with existing cart items in database

**Test:**
- [ ] Logout
- [ ] Add different items as guest
- [ ] Login with the account
- [ ] ✅ Should see all items merged

**Debug if fails:**
- Check `syncWithServer()` is called on login
- Verify merge logic in cart store
- Check both localStorage and API responses

### 4. Test Multi-device

- [ ] Login on Device/Browser 1
- [ ] Add items
- [ ] Login on Device/Browser 2 with same account
- [ ] ✅ Should see same items
- [ ] Add item on Device 2
- [ ] Refresh Device 1
- [ ] ✅ Should see new item

---

## Monitoring

### API Endpoints to Monitor

1. **GET /api/cart/:userId**
   - Expected: 200 OK
   - Monitor: Response time, error rate

2. **POST /api/cart/:userId**
   - Expected: 200 OK
   - Monitor: Success rate, latency

3. **DELETE /api/cart/:userId**
   - Expected: 200 OK
   - Monitor: Usage frequency

### Database Queries

```sql
-- Count total cart items
SELECT COUNT(*) FROM cart_items;

-- Count users with carts
SELECT COUNT(DISTINCT userId) FROM cart_items;

-- Average items per user
SELECT AVG(item_count) FROM (
  SELECT COUNT(*) as item_count 
  FROM cart_items 
  GROUP BY userId
);

-- Most popular products in carts
SELECT productName, SUM(quantity) as total 
FROM cart_items 
GROUP BY productId 
ORDER BY total DESC 
LIMIT 10;
```

---

## Rollback Plan

If issues arise after deployment:

### Immediate Rollback

```bash
# Backend
cd backend
wrangler rollback

# Frontend
# Restore previous deployment via hosting dashboard
```

### Data Preservation

Cart items are already in database and localStorage, so rollback won't lose data.

### Graceful Degradation

The app will continue to work even if cart API fails:
- Guest users: Cart in localStorage (unaffected)
- Authenticated users: Falls back to localStorage if API fails

---

## Success Criteria

✅ **All tests pass**
- Guest cart persists
- Authenticated cart syncs
- Merge works correctly
- Multi-device sync works

✅ **No errors in logs**
- Backend: Check Cloudflare Workers logs
- Frontend: Check browser console
- Database: No query errors

✅ **Performance acceptable**
- API response time < 500ms
- Page load not impacted
- No UI lag when adding items

✅ **User feedback positive**
- No reports of lost carts
- Smooth login experience
- Multi-device works

---

## Troubleshooting

### Issue: "401 Unauthorized" on cart API

**Cause:** Auth token missing or invalid

**Fix:**
1. Check login flow is setting token correctly
2. Verify token in localStorage: `localStorage.getItem('token')`
3. Check token expiration
4. Re-login to get fresh token

### Issue: Cart not saving to server

**Cause:** API endpoint not working

**Fix:**
1. Check Network tab for failed requests
2. Verify backend is deployed: `curl https://your-api.com/api/health`
3. Check backend logs for errors
4. Verify database schema is applied

### Issue: Duplicate items after merge

**Cause:** Merge logic bug

**Fix:**
1. Check `mergeWithServerCart()` implementation
2. Verify productId comparison is correct
3. Test merge logic with console logs
4. Check for race conditions

### Issue: Cart cleared unexpectedly

**Cause:** localStorage cleared or logout bug

**Fix:**
1. Check logout flow - should save to server first
2. Verify localStorage isn't being cleared elsewhere
3. Check for conflicting code clearing cart
4. Add logging to track when cart is cleared

---

## Emergency Contacts

**Technical Issues:**
- Check documentation: `CART_PERSISTENCE.md`
- Review tests: `CART_TESTING.md`
- Backend logs: Cloudflare Workers dashboard
- Database queries: D1 dashboard

**Known Limitations:**
- Cart items don't check stock availability on load
- No price validation when loading saved cart
- No cart expiration (items persist indefinitely)

---

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch error rates
   - Check user reports
   - Monitor API performance

2. **Gather feedback**
   - User surveys
   - Support tickets
   - Analytics data

3. **Plan improvements**
   - See "Future Enhancements" in CART_IMPLEMENTATION_SUMMARY.md
   - Prioritize based on user feedback

4. **Document learnings**
   - Update troubleshooting guide
   - Add new edge cases discovered
   - Improve error handling

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Status:** _____________  

**Sign off:**
- [ ] Database schema applied
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All tests passed
- [ ] Monitoring in place
- [ ] Documentation updated

✅ **Ready for production!**
