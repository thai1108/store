# 🤖 GitHub Actions CI/CD Setup

Hướng dẫn này giúp bạn thiết lập tự động deploy khi push code lên GitHub.

## 📋 Yêu Cầu

1. Repository GitHub
2. Tài khoản Cloudflare
3. Đã deploy thủ công ít nhất 1 lần

## 🔧 Setup Steps

### 1. Get Cloudflare API Token

1. Đăng nhập Cloudflare Dashboard: https://dash.cloudflare.com
2. Vào **My Profile** → **API Tokens**
3. Click **Create Token**
4. Chọn template **Edit Cloudflare Workers**
5. Thêm permissions:
   - Account Settings: Read
   - Workers Scripts: Edit
   - Workers Routes: Edit
   - Cloudflare Pages: Edit
6. Click **Continue to summary** → **Create Token**
7. **Copy token** (chỉ hiện 1 lần!)

### 2. Get Cloudflare Account ID

1. Vào Cloudflare Dashboard
2. Chọn bất kỳ site nào (hoặc Workers & Pages)
3. Account ID hiển thị ở sidebar phải
4. Copy Account ID

### 3. Get Worker URL (Backend URL)

Sau khi deploy backend, Worker URL sẽ có dạng:
```
https://store-backend.abc123.workers.dev
```

API URL sẽ là:
```
https://store-backend.abc123.workers.dev/api
```

### 4. Add GitHub Secrets

1. Vào GitHub repository của bạn
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm các secrets sau:

#### Secret 1: CLOUDFLARE_API_TOKEN
- Name: `CLOUDFLARE_API_TOKEN`
- Value: Token từ bước 1

#### Secret 2: CLOUDFLARE_ACCOUNT_ID
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: Account ID từ bước 2

#### Secret 3: VITE_API_URL
- Name: `VITE_API_URL`
- Value: `https://store-backend.YOUR_SUBDOMAIN.workers.dev/api`
- (Thay YOUR_SUBDOMAIN bằng subdomain thực tế)

### 5. Enable GitHub Actions

1. Vào repository → **Actions**
2. Enable workflows nếu chưa enable
3. File workflow đã được tạo tại: `.github/workflows/deploy.yml`

## 🚀 How It Works

### Automatic Deployment

Mỗi khi bạn push code lên branch `main`:
1. GitHub Actions tự động chạy
2. Build và deploy backend lên Cloudflare Workers
3. Build và deploy frontend lên Cloudflare Pages
4. Deployment hoàn tất trong 2-3 phút

### Manual Deployment

Bạn cũng có thể trigger deploy thủ công:
1. Vào **Actions** tab
2. Chọn workflow **Deploy to Cloudflare**
3. Click **Run workflow**
4. Chọn branch và click **Run workflow**

## 📊 View Deployment Status

### On GitHub:
- **Actions** tab → Xem workflow runs
- Click vào run để xem logs chi tiết

### On Cloudflare:
- **Workers & Pages** → `store-backend` → Xem deployments
- **Workers & Pages** → `store-frontend` → Xem deployments

## 🔍 Workflow Structure

```yaml
deploy-backend:
  - Checkout code
  - Install dependencies
  - Deploy to Workers

deploy-frontend:
  - Wait for backend deployment
  - Checkout code
  - Install dependencies
  - Build with production API URL
  - Deploy to Pages
```

Frontend deployment chờ backend xong để đảm bảo API sẵn sàng.

## 🐛 Troubleshooting

### Deployment Failed - "Invalid API Token"
**Giải pháp:**
- Tạo lại API token với đủ permissions
- Update GitHub secret `CLOUDFLARE_API_TOKEN`

### Deployment Failed - "Account not found"
**Giải pháp:**
- Kiểm tra `CLOUDFLARE_ACCOUNT_ID` có đúng không
- Đảm bảo Account ID không có khoảng trắng

### Frontend Can't Connect to Backend
**Giải pháp:**
- Kiểm tra `VITE_API_URL` secret
- Đảm bảo URL đúng format: `https://...workers.dev/api`
- Re-run workflow

### Build Failed - "Module not found"
**Giải pháp:**
- Xóa `node_modules` local
- Push lại để GitHub Actions cài đặt clean

## 🔐 Security Notes

1. **Never commit secrets** to Git
2. API tokens chỉ hiện 1 lần, lưu an toàn
3. Có thể rotate tokens bất cứ lúc nào
4. GitHub Secrets được encrypt

## 📝 Customization

### Deploy on Different Branches

Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches:
      - main
      - staging  # Add more branches
```

### Add Environment-Specific Deploys

```yaml
# Deploy staging on 'develop' branch
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  # Deploy to staging environment
```

### Add Tests Before Deploy

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
  
  deploy-backend:
    needs: test  # Wait for tests
    # ... rest of deployment
```

## 🎯 Benefits of CI/CD

✅ **Automatic deployments** - Push and forget
✅ **Consistent builds** - Same environment every time
✅ **Fast feedback** - See if deployment works
✅ **Version control** - Easy to rollback
✅ **Team collaboration** - Everyone can deploy safely

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

## ✅ Setup Checklist

- [ ] Có tài khoản Cloudflare
- [ ] Đã tạo Cloudflare API Token
- [ ] Đã copy Cloudflare Account ID
- [ ] Đã biết Worker URL (backend URL)
- [ ] Đã add 3 GitHub Secrets:
  - [ ] CLOUDFLARE_API_TOKEN
  - [ ] CLOUDFLARE_ACCOUNT_ID
  - [ ] VITE_API_URL
- [ ] Đã enable GitHub Actions
- [ ] Đã test 1 deployment thủ công

## 🎉 Done!

Giờ đây, mỗi khi push code lên `main` branch:
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

GitHub Actions sẽ tự động deploy! 🚀

Check deployment status tại:
- GitHub: Repository → Actions
- Cloudflare: Dashboard → Workers & Pages
