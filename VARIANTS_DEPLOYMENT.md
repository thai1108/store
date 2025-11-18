# Quick Deployment Guide - Product Variants & Images

## Bước 1: Stop Services
```bash
./stop-dev.sh
```

## Bước 2: Recreate Database

### Local Development
```bash
# Xóa database cũ
rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*

# Tạo lại từ schema
cd backend
wrangler d1 execute DB --local --file=schema.sql
wrangler d1 execute DB --local --file=sample-data.sql
```

### Production
```bash
cd backend
wrangler d1 execute DB --remote --file=schema.sql
wrangler d1 execute DB --remote --file=sample-data.sql
```

## Bước 3: Restart Services
```bash
./start-dev.sh
```

## Bước 5: Test Features

### Admin Panel Testing
1. Login as admin
2. Go to Products Management
3. Try creating a new product:
   - Upload multiple images
   - Add variants (sizes)
   - Save and verify

### Customer Testing  
1. Browse products
2. Check image carousel works
3. Select different sizes
4. Add to cart
5. Verify cart shows size
6. Complete checkout

## Troubleshooting

### Lỗi "FOREIGN KEY constraint failed"
Nếu gặp lỗi này khi tạo sản phẩm, xóa và tạo lại database:
```bash
./stop-dev.sh
rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*
cd backend
wrangler d1 execute DB --local --file=schema.sql
wrangler d1 execute DB --local --file=sample-data.sql
cd ..
./start-dev.sh
```

### R2 Upload Issues
Verify R2 bucket is configured in `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "your-bucket-name"
```

### Type Errors
If TypeScript errors appear:
```bash
cd frontend
npm run type-check
```

## Rollback (if needed)

Nếu có vấn đề, rollback bằng cách:
1. Restore database backup
2. Git revert changes
3. Restart services

## Production Deployment

```bash
# Deploy backend
cd backend
wrangler deploy

# Deploy frontend
cd ../frontend
npm run build
# Then deploy dist/ to your hosting
```

## Notes
- Migration preserves existing data
- Existing products will have empty variants/images arrays
- Cart items without variants will work normally
- Test thoroughly before production deployment
