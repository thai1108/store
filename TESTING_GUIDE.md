# Quick Start Guide - Profile & Order History

## How to Test the New Features

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Access the Application

Open your browser and navigate to: `http://localhost:5173`

### 3. Test Profile Page

1. **Login or Register**
   - If you don't have an account, click "Register" and create one
   - Login with your credentials

2. **Navigate to Profile**
   - Click on your name in the top navigation bar
   - Select "Profile" from the dropdown menu
   - You should see your profile page with all your information

3. **Test Profile Editing**
   - Click the "Edit" button
   - Modify your name, phone, or address
   - Click "Save" - you should see a success message
   - The changes should persist after page refresh

4. **Test Avatar Upload**
   - Click "Change Avatar" button
   - Select an image file (< 5MB)
   - You should see a preview of the image
   - Click "Upload" button
   - The avatar should update (currently shows a placeholder URL)

### 4. Test Order History Page

1. **Place an Order** (if you haven't already)
   - Go to Products page
   - Add items to cart
   - Go to Cart → Checkout
   - Fill in customer information
   - Place the order

2. **View Order History**
   - Click "Orders" in the navigation bar
   - You should see your order(s) listed

3. **Expand Order Details**
   - Click on any order card to expand
   - Verify all information displays correctly:
     - Customer information
     - Order items with quantities and prices
     - Total amount
     - Order status

### 5. Test Different Languages

1. **Switch to Vietnamese**
   - Click the language button (globe icon) in navigation
   - Select "🇻🇳 Tiếng Việt"
   - All text should change to Vietnamese

2. **Switch back to English**
   - Click language button again
   - Select "🇬🇧 English"

### 6. Test Mobile Responsive

1. Open browser DevTools (F12)
2. Toggle device toolbar (responsive mode)
3. Test on different screen sizes:
   - iPhone (375px)
   - iPad (768px)
   - Desktop (1024px+)

## Expected Results

✅ **Profile Page:**
- Displays user information correctly
- Edit mode works properly
- Save button updates data
- Avatar upload shows preview
- All fields validated correctly
- Email and role are read-only
- Responsive on mobile

✅ **Order History:**
- Shows all user orders
- Orders sorted by newest first
- Status badges colored correctly
- Expand/collapse works smoothly
- All order details display
- Empty state when no orders
- Responsive on mobile

## Troubleshooting

### Profile not updating?
- Check browser console for errors
- Verify JWT token is valid
- Try logging out and back in

### Orders not showing?
- Ensure you've placed at least one order
- Check network tab for API response
- Verify authentication token

### Avatar not uploading?
- Check file size (must be < 5MB)
- Verify file type is an image
- Check browser console for errors
- Note: Currently uses placeholder URL

### Database errors?
- Run migration script: `./apply-migration.sh`
- Or reset database: `cd backend && npm run setup`

## Need Help?

Check the detailed documentation: `PROFILE_ORDER_HISTORY.md`
