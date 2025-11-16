# Store Project - Snack/Drink/Milk Tea Selling Website

## 📝 Mô tả dự án
Website bán đồ ăn vặt, đồ uống và trà sữa với tính năng quản lý sản phẩm, đơn hàng và đăng nhập người dùng để lưu lịch sử đơn hàng.

## 🛠️ Công nghệ sử dụng
- **Backend**: Cloudflare Worker (Serverless)
- **Frontend**: Vue 3 + TypeScript + Vite
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **Styling**: CSS3 với responsive design

## 🏗️ Cấu trúc dự án
```
store/
├── backend/                 # Cloudflare Worker backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utilities
│   ├── index.ts            # Main worker entry
│   ├── schema.sql          # Database schema
│   ├── wrangler.toml       # Cloudflare config
│   └── package.json
├── frontend/               # Vue frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page views
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API services
│   │   ├── router/         # Vue router
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Static assets
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Cài đặt và chạy

### Điều kiện tiên quyết
- Node.js (v16+)
- npm hoặc yarn
- Cloudflare account
- Wrangler CLI

### 1. Cài đặt Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Clone project và cài đặt dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Cấu hình Cloudflare

#### Đăng nhập Cloudflare
```bash
wrangler login
```

#### Tạo D1 Database
```bash
cd backend
wrangler d1 create store-db
```

#### Tạo KV Namespace
```bash
wrangler kv:namespace create "ORDER_CACHE"
```

#### Tạo R2 Bucket
```bash
wrangler r2 bucket create store-images
```

#### Cập nhật wrangler.toml với các ID được tạo

### 4. Khởi tạo Database
```bash
cd backend
wrangler d1 execute store-db --file=./schema.sql
```

### 5. Chạy development

#### Backend (Cloudflare Worker)
```bash
cd backend
npm run dev
```

#### Frontend (Vue)
```bash
cd frontend
npm run dev
```

### 6. Deploy production

#### Backend
```bash
cd backend
npm run deploy
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to Cloudflare Pages
```

## 📋 Tính năng chính

### Khách hàng (Customer)
- ✅ Xem danh sách sản phẩm theo danh mục
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Đặt hàng không cần đăng ký
- ✅ Đăng ký/đăng nhập để lưu lịch sử
- ✅ Xem lịch sử đơn hàng (khi đã đăng nhập)
- ✅ Quản lý profile (tên, SĐT, địa chỉ, avatar)
- ✅ Xem chi tiết đơn hàng đã đặt
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt & English)

### Admin
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Dashboard tổng quan
- 🚧 Quản lý khách hàng

## 🔗 API Endpoints

### Products
```
GET    /api/products          # Lấy danh sách sản phẩm
GET    /api/products/:id      # Lấy chi tiết sản phẩm
POST   /api/products          # Tạo sản phẩm mới (Admin)
PUT    /api/products/:id      # Cập nhật sản phẩm (Admin)
DELETE /api/products/:id      # Xóa sản phẩm (Admin)
```

### Orders
```
POST   /api/orders            # Tạo đơn hàng
GET    /api/orders/:id        # Lấy chi tiết đơn hàng
PUT    /api/orders/:id/status # Cập nhật trạng thái đơn hàng
```

### Users
```
POST   /api/users/register    # Đăng ký
POST   /api/users/login       # Đăng nhập
GET    /api/users/me          # Thông tin user hiện tại
GET    /api/users/me/orders   # Lịch sử đơn hàng của user
PUT    /api/users/me          # Cập nhật profile
POST   /api/users/me/avatar   # Upload avatar
```

### Health Check
```
GET    /api/health            # Kiểm tra trạng thái API
```

## 🎨 UI/UX Features
- ✅ Responsive design (mobile-first)
- ✅ Modern card-based layout
- ✅ Shopping cart with live updates
- ✅ User authentication flow
- ✅ Loading states và error handling
- ✅ Toast notifications
- ✅ Clean navigation

## 🔒 Security
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Input validation
- ✅ CORS configuration
- ✅ SQL injection protection

## 📊 Performance
- ✅ Cloudflare edge locations
- ✅ KV cache for orders
- ✅ Optimized images
- ✅ Code splitting (Vite)

## 🧪 Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

Dự án hỗ trợ deploy lên Cloudflare với cả backend (Workers) và frontend (Pages).

### 🎯 Quick Deploy (Khuyến nghị)

#### 1. Cài đặt và đăng nhập Wrangler
```bash
npm install -g wrangler
wrangler login
```

#### 2. Tạo Production Database
```bash
cd backend
wrangler d1 create store-db-production
```
Copy `database_id` và cập nhật trong `backend/wrangler.toml`

#### 3. Setup Database
```bash
wrangler d1 execute store-db-production --file=schema.sql --env production
wrangler d1 execute store-db-production --file=sample-data.sql --env production
```

#### 4. Deploy tự động
```bash
# Từ thư mục gốc
./deploy-all.sh
```

### 📚 Tài liệu chi tiết

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Hướng dẫn deploy nhanh 5 phút
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Hướng dẫn chi tiết đầy đủ
- **[CICD_SETUP.md](./CICD_SETUP.md)** - Setup GitHub Actions tự động deploy

### 🤖 CI/CD với GitHub Actions

Setup GitHub Actions để tự động deploy khi push code:
1. Xem hướng dẫn trong [CICD_SETUP.md](./CICD_SETUP.md)
2. Add GitHub Secrets (API Token, Account ID)
3. Push code lên `main` branch
4. GitHub tự động deploy! 🎉

### 📍 URLs Sau Khi Deploy

- **Backend API**: `https://store-backend.YOUR_SUBDOMAIN.workers.dev`
- **Frontend**: `https://store-frontend.pages.dev`
- **Custom Domain**: Có thể setup custom domain qua Cloudflare Dashboard

## 🤝 Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License
This project is licensed under the MIT License.

## 📞 Liên hệ
- Developer: [Your Name]
- Email: example@mail.com
- Phone: 0123456789

---

⭐ **Star this repo if it helped you!**