# Profile & Order History Implementation

## Overview
This document describes the implementation of the Profile page and Order History page for the TeaStore application.

## Features Implemented

### 1. Profile Page (`/profile`)
A comprehensive user profile management page with the following features:

#### Features:
- **View Profile Information**: Display all user details including email, name, phone, address, role, and member since date
- **Edit Profile**: Edit name, phone number, and delivery address
- **Avatar Management**: 
  - Upload custom avatar images (up to 5MB)
  - Preview avatar before uploading
  - Default placeholder avatar with user initials
- **Read-only Fields**: Email and role cannot be modified
- **Responsive Design**: Optimized for mobile and desktop devices
- **i18n Support**: Full Vietnamese and English translations

#### Security:
- Protected route requiring authentication
- JWT token verification on backend
- User can only view/edit their own profile

### 2. Order History Page (`/orders`)
A detailed order history page showing all past orders:

#### Features:
- **Order List**: Display all user orders sorted by date (newest first)
- **Order Summary**: Show order number, date, total amount, and status
- **Expandable Details**: Click to expand and view:
  - Customer information (name, phone, email, address)
  - All order items with quantities and prices
  - Order notes
  - Total amount
- **Status Badges**: Color-coded status indicators:
  - 🟡 Pending - Yellow
  - 🔵 Confirmed - Blue
  - 🟢 Completed - Green
  - 🔴 Cancelled - Red
- **Empty State**: Helpful message when no orders exist with link to start shopping
- **Loading States**: Smooth loading indicators
- **Error Handling**: Retry functionality for failed requests
- **Responsive Design**: Mobile-optimized layout

#### Security:
- Protected route requiring authentication
- Users can only view their own orders
- JWT token verification

## Technical Implementation

### Frontend Changes

#### New Files:
1. **`/frontend/src/views/ProfileView.vue`**
   - Vue 3 Composition API component
   - Form validation
   - Image upload with preview
   - Real-time user data updates

2. **`/frontend/src/views/OrderHistoryView.vue`** (Completed)
   - Replaced placeholder with full implementation
   - Expandable order cards
   - Formatted dates and currency
   - Status color coding

#### Modified Files:
1. **`/frontend/src/types/auth.ts`**
   - Added `address?: string` to User interface
   - Added `avatarUrl?: string` to User interface

2. **`/frontend/src/services/auth-service.ts`**
   - Added `updateProfile()` method
   - Added `uploadAvatar()` method

3. **`/frontend/src/router/index.ts`**
   - Added `/profile` route with auth guard

4. **`/frontend/src/components/NavBar.vue`**
   - Added "Profile" menu item in user dropdown

5. **`/frontend/src/locales/en.ts` & `vi.ts`**
   - Added `profile` translations
   - Expanded `orders` translations

### Backend Changes

#### Modified Files:
1. **`/backend/schema.sql`**
   - Added `address TEXT` column to users table
   - Added `avatarUrl TEXT` column to users table

2. **`/backend/types/auth.ts`**
   - Added `address?: string` to User interface
   - Added `avatarUrl?: string` to User interface

3. **`/backend/routes/user.routes.ts`**
   - Added `PUT /api/users/me` endpoint for profile updates
   - Added `POST /api/users/me/avatar` endpoint for avatar upload

#### New Files:
1. **`/backend/migrate-user-fields.sql`**
   - Migration script for existing databases
   - Adds address and avatarUrl columns

2. **`/apply-migration.sh`**
   - Shell script to apply database migration
   - Works with local development database

### API Endpoints

#### New Endpoints:

1. **Update Profile**
   ```
   PUT /api/users/me
   Authorization: Bearer <token>
   Body: {
     "name": "John Doe",
     "phone": "0123456789",
     "address": "123 Main St, City"
   }
   Response: {
     "success": true,
     "data": <User>
   }
   ```

2. **Upload Avatar**
   ```
   POST /api/users/me/avatar
   Authorization: Bearer <token>
   Content-Type: multipart/form-data
   Body: FormData with 'avatar' file
   Response: {
     "success": true,
     "data": {
       "avatarUrl": "https://..."
     }
   }
   ```

#### Existing Endpoint Used:
- `GET /api/users/me/orders` - Fetch user's order history

## Database Migration

### For New Installations:
The schema already includes the new columns. Just run:
```bash
./setup.sh
```

### For Existing Databases:
Apply the migration to add new columns:
```bash
# For local development database
./apply-migration.sh

# Or manually with wrangler
cd backend
wrangler d1 execute DB --local --file=migrate-user-fields.sql

# For production database
wrangler d1 execute DB --file=migrate-user-fields.sql
```

## How to Use

### Accessing Profile:
1. Login to your account
2. Click on your name in the navigation bar
3. Select "Profile" from the dropdown menu
4. Edit your information and click "Save"
5. Upload an avatar by clicking "Change Avatar"

### Viewing Orders:
1. Login to your account
2. Click "Orders" in the navigation bar
3. View list of all your orders
4. Click on any order to expand and see details

## Navigation Flow

```
NavBar (User Menu)
├── Profile → /profile
│   ├── View/Edit Personal Info
│   └── Upload Avatar
└── Logout

NavBar
└── Orders → /orders
    └── View Order History
        └── Expand Order Details
```

## Responsive Design

### Mobile (< 768px):
- Stacked layout for profile form
- Full-width buttons and inputs
- Collapsible order cards
- Touch-friendly expand buttons

### Desktop (≥ 768px):
- Two-column layout for profile info
- Side-by-side form actions
- Compact order summaries
- Hover effects

## i18n Support

All text is fully translated in both English and Vietnamese:
- Profile page labels and hints
- Order history statuses and labels
- Error messages and placeholders
- Button texts and actions

## Avatar Upload Notes

Currently, the avatar upload generates a placeholder URL using the UI Avatars API:
```
https://ui-avatars.com/api/?name=<UserName>&size=200&background=667eea&color=fff
```

**For Production:**
You should integrate with cloud storage:
- Cloudflare R2 (recommended for Cloudflare Workers)
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

Update the `POST /api/users/me/avatar` endpoint in `/backend/routes/user.routes.ts` to handle actual file uploads.

## Testing

### Manual Testing Checklist:

**Profile Page:**
- [ ] Can view profile information
- [ ] Can edit name, phone, address
- [ ] Email and role are read-only
- [ ] Avatar placeholder shows user initial
- [ ] Can select avatar file
- [ ] File size validation works (> 5MB rejected)
- [ ] Image preview works
- [ ] Upload button appears after selecting file
- [ ] Profile updates persist after save
- [ ] Success message appears after save
- [ ] Cancel button restores original values

**Order History:**
- [ ] Shows empty state when no orders
- [ ] Lists all user orders
- [ ] Orders sorted by date (newest first)
- [ ] Order status displays correctly with colors
- [ ] Can expand/collapse order details
- [ ] Customer info displays correctly
- [ ] Order items list correctly
- [ ] Total amount calculates correctly
- [ ] Notes display if present
- [ ] Date formats correctly
- [ ] Currency formats correctly (VND)

## Known Limitations

1. **Avatar Upload**: Currently uses placeholder URLs. Production deployment should use actual cloud storage.
2. **Password Change**: Not implemented in this version. Should be added as separate feature with email verification.
3. **Email Change**: Not supported as it requires verification flow.
4. **Order Cancellation**: Users cannot cancel orders from history page (admin only feature).

## Future Enhancements

1. **Password Management**: Add change password functionality
2. **Order Actions**: Allow users to re-order or cancel pending orders
3. **Order Tracking**: Add delivery tracking information
4. **Profile Picture**: Integrate with real cloud storage
5. **Address Book**: Allow multiple saved addresses
6. **Order Filters**: Filter orders by status and date range
7. **Export Orders**: Download order history as PDF/CSV
8. **Email Notifications**: Send confirmation emails for profile changes

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own data
3. **Input Validation**: Form validation on frontend and backend
4. **File Upload**: Size and type restrictions for avatar uploads
5. **SQL Injection**: Using parameterized queries
6. **XSS Protection**: Vue 3 automatic escaping

## Performance Optimization

1. **Lazy Loading**: Order details only rendered when expanded
2. **Image Optimization**: Avatar size limited to reduce bandwidth
3. **Pagination**: Consider implementing for users with many orders
4. **Caching**: Store user profile in Pinia store to reduce API calls
5. **Debouncing**: Form validation debounced to reduce re-renders

## Styling

Uses consistent styling with the rest of the application:
- **Primary Color**: #667eea (purple gradient)
- **Success**: Green tones
- **Warning**: Yellow/Orange tones
- **Error**: Red tones
- **Border Radius**: 8-12px
- **Shadows**: Subtle box-shadows on cards
- **Animations**: Smooth transitions and slide-ins

## Conclusion

The Profile and Order History pages are now fully implemented with:
- ✅ Complete UI/UX design
- ✅ Backend API integration
- ✅ Database schema updates
- ✅ Authentication & authorization
- ✅ i18n support (EN/VI)
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

Users can now manage their profiles and view their complete order history with an intuitive, beautiful interface.
