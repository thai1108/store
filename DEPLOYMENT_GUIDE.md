# 🚀 Hướng Dẫn Deploy Lên Cloudflare

Tài liệu này hướng dẫn chi tiết cách deploy dự án TeaStore lên Cloudflare (Backend: Workers, Frontend: Pages).

## 📋 Yêu Cầu Trước Khi Deploy

### 1. Tài Khoản Cloudflare
- Đăng ký tài khoản miễn phí tại: https://dash.cloudflare.com/sign-up
- Free tier đã đủ để chạy dự án này

### 2. Cài Đặt Wrangler CLI
```bash
npm install -g wrangler
```

### 3. Đăng Nhập Cloudflare
```bash
wrangler login
```
Lệnh này sẽ mở trình duyệt để bạn xác thực.

## 🎯 Các Bước Deploy

### Cách 1: Deploy Tự Động (Khuyến Nghị)

Chạy script deploy toàn bộ:
```bash
./deploy-all.sh
```

Script này sẽ:
1. Deploy backend (Workers) trước
2. Hỏi bạn xác nhận trước khi deploy frontend
3. Deploy frontend (Pages)

### Cách 2: Deploy Từng Phần

#### Bước 1: Tạo Production Database

```bash
cd backend
wrangler d1 create store-db-production
```

Bạn sẽ nhận được output như này:
```
✅ Successfully created DB 'store-db-production'

[[d1_databases]]
binding = "DB"
database_name = "store-db-production"
database_id = "abc123-def456-ghi789"
```

**Quan trọng:** Copy `database_id` và cập nhật trong `backend/wrangler.toml`:
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "store-db-production"
database_id = "abc123-def456-ghi789"  # Thay bằng ID thực tế
```

#### Bước 2: Khởi Tạo Database Schema

```bash
cd backend

# Apply schema
wrangler d1 execute store-db-production --file=schema.sql --env production

# Insert sample data (optional)
wrangler d1 execute store-db-production --file=sample-data.sql --env production
```

#### Bước 3: Deploy Backend

```bash
./deploy-backend.sh
```

Hoặc thủ công:
```bash
cd backend
npm run deploy -- --env production
```

Sau khi deploy thành công, bạn sẽ thấy URL như:
```
https://store-backend.YOUR_SUBDOMAIN.workers.dev
```

**Quan trọng:** Copy URL này!

#### Bước 4: Cấu Hình Frontend

Mở file `frontend/.env.production` và cập nhật:
```env
VITE_API_URL=https://store-backend.YOUR_SUBDOMAIN.workers.dev/api
```

Thay `YOUR_SUBDOMAIN` bằng subdomain thực tế từ bước 3.

#### Bước 5: Deploy Frontend

```bash
./deploy-frontend.sh
```

Hoặc thủ công:
```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name=store-frontend
```

Frontend sẽ được deploy tại:
```
https://store-frontend.pages.dev
```

## 🔧 Cấu Hình Tùy Chỉnh

### Custom Domain (Tùy Chọn)

#### Cho Backend (Workers):
1. Vào Cloudflare Dashboard → Workers & Pages
2. Chọn `store-backend`
3. Vào Settings → Domains & Routes
4. Add custom domain: `api.yourdomain.com`

#### Cho Frontend (Pages):
1. Vào Cloudflare Dashboard → Workers & Pages
2. Chọn `store-frontend`
3. Vào Custom domains
4. Add custom domain: `yourdomain.com`

### Environment Variables (Biến môi trường)

#### Backend:
Thêm biến môi trường trong `wrangler.toml`:
```toml
[env.production.vars]
JWT_SECRET = "your-super-secret-jwt-key-change-this"
ENVIRONMENT = "production"
```

Hoặc thêm qua Dashboard:
- Workers & Pages → store-backend → Settings → Variables

#### Frontend:
Thêm biến môi trường trong Pages Dashboard:
- Workers & Pages → store-frontend → Settings → Environment variables

## 🔍 Kiểm Tra Deployment

### 1. Test Backend API
```bash
# Health check
curl https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/products

# Should return list of products
```

### 2. Test Frontend
Mở trình duyệt và truy cập:
```
https://store-frontend.pages.dev
```

### 3. Test Full Flow
1. Đăng ký tài khoản mới
2. Đăng nhập
3. Thêm sản phẩm vào giỏ hàng
4. Đặt hàng
5. Xem lịch sử đơn hàng
6. Cập nhật profile

## 📊 Monitoring & Logs

### Xem Logs Backend:
```bash
wrangler tail store-backend --env production
```

Hoặc trong Dashboard:
- Workers & Pages → store-backend → Logs

### Xem Logs Frontend:
- Workers & Pages → store-frontend → Deployment logs

### Analytics:
Cloudflare tự động cung cấp analytics cho cả Workers và Pages trong Dashboard.

## 🔄 Cập Nhật Ứng Dụng

### Update Backend:
```bash
cd backend
# Make your changes
npm run deploy -- --env production
```

### Update Frontend:
```bash
cd frontend
# Make your changes
npm run build
wrangler pages deploy dist --project-name=store-frontend
```

### Update Database Schema:
```bash
cd backend

# Create migration file
cat > migration-YYYY-MM-DD.sql << EOF
-- Your migration SQL here
ALTER TABLE users ADD COLUMN new_field TEXT;
EOF

# Apply migration
wrangler d1 execute store-db-production --file=migration-YYYY-MM-DD.sql --env production
```

## 🐛 Troubleshooting

### Lỗi: "Database not found"
**Giải pháp:**
- Kiểm tra `database_id` trong `wrangler.toml` có đúng không
- Chạy lại: `wrangler d1 create store-db-production`

### Lỗi: "Unauthorized" khi gọi API
**Giải pháp:**
- Kiểm tra CORS settings
- Xem logs: `wrangler tail store-backend --env production`
- Đảm bảo JWT_SECRET được set đúng

### Lỗi: Frontend không kết nối được Backend
**Giải pháp:**
- Kiểm tra `VITE_API_URL` trong `.env.production`
- Rebuild frontend: `npm run build`
- Deploy lại: `wrangler pages deploy dist --project-name=store-frontend`

### Lỗi: "Module not found" khi deploy
**Giải pháp:**
```bash
cd backend
npm install
npm run deploy -- --env production
```

### Lỗi: Pages deployment failed
**Giải pháp:**
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
wrangler pages deploy dist --project-name=store-frontend
```

## 💰 Chi Phí

### Free Tier Limits:
- **Workers:** 100,000 requests/day
- **D1 Database:** 5GB storage, 5M rows read/day
- **Pages:** Unlimited requests
- **Bandwidth:** 100GB/month (shared)

### Nâng Cấp:
Nếu vượt quá free tier, bạn sẽ được chuyển sang Workers Paid ($5/month):
- Workers: $0.50/million requests
- D1: $0.75/GB storage
- Bandwidth: $0.09/GB

## 🔐 Security Best Practices

1. **JWT Secret:**
   - Thay đổi JWT_SECRET trong production
   - Không commit JWT_SECRET vào Git

2. **CORS:**
   - Chỉ cho phép origins cụ thể trong production
   - Cập nhật CORS settings trong `backend/utils/cors.ts`

3. **Rate Limiting:**
   - Cân nhắc thêm rate limiting cho API
   - Sử dụng Cloudflare Workers KV hoặc Durable Objects

4. **Environment Variables:**
   - Không hardcode secrets trong code
   - Sử dụng Cloudflare Dashboard để set sensitive variables

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🎯 Quick Commands Cheat Sheet

```bash
# Login
wrangler login

# Create database
wrangler d1 create store-db-production

# Execute SQL
wrangler d1 execute DB_NAME --file=schema.sql --env production

# Deploy backend
cd backend && npm run deploy -- --env production

# Deploy frontend
cd frontend && npm run build && wrangler pages deploy dist

# View logs
wrangler tail store-backend --env production

# List deployments
wrangler deployments list

# Rollback deployment
wrangler rollback [deployment-id]
```

## ✅ Deployment Checklist

- [ ] Đã cài đặt wrangler CLI
- [ ] Đã login Cloudflare: `wrangler login`
- [ ] Đã tạo production database
- [ ] Đã cập nhật `database_id` trong `wrangler.toml`
- [ ] Đã apply database schema
- [ ] Đã deploy backend thành công
- [ ] Đã copy Worker URL
- [ ] Đã cập nhật `VITE_API_URL` trong `frontend/.env.production`
- [ ] Đã build frontend: `npm run build`
- [ ] Đã deploy frontend thành công
- [ ] Đã test API endpoint
- [ ] Đã test frontend application
- [ ] Đã test đăng ký/đăng nhập
- [ ] Đã test đặt hàng
- [ ] Đã test profile & order history

## 🎉 Kết Luận

Sau khi hoàn tất tất cả các bước, ứng dụng của bạn sẽ chạy trên:
- **Backend:** `https://store-backend.YOUR_SUBDOMAIN.workers.dev`
- **Frontend:** `https://store-frontend.pages.dev`

Ứng dụng đã sẵn sàng phục vụ người dùng với:
- ⚡ Performance cao (Cloudflare Edge Network)
- 🌍 Global distribution
- 🔒 HTTPS tự động
- 💰 Free tier hào phóng
- 📊 Built-in analytics
- 🛡️ DDoS protection

Chúc bạn deploy thành công! 🚀
