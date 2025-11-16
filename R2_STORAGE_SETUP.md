# 🗄️ Cloudflare R2 Storage Setup

## Tổng quan

Ứng dụng TeaStore đã được cấu hình để sử dụng **Cloudflare R2** để lưu trữ file thay vì base64 trong database. Giải pháp này tốt hơn về mặt hiệu suất, chi phí và khả năng mở rộng.

## ✅ Đã triển khai

### 1. R2 Buckets
- ✅ **store-uploads** - Development bucket
- ✅ **store-uploads-production** - Production bucket

### 2. Backend Components

#### Upload Service (`/backend/utils/upload.ts`)
```typescript
// Tính năng chính:
- Upload file với validation (type, size)
- Tự động tạo tên file unique
- Hỗ trợ nhiều folders (avatars, products, etc.)
- Delete file cũ khi upload mới
- Get file từ R2
```

#### Storage Routes (`/backend/routes/storage.routes.ts`)
```typescript
// Endpoint để serve files từ R2:
GET /api/storage/:folder/:filename
// Ví dụ: GET /api/storage/avatars/1731765200000-abc123.jpg
```

#### Avatar Upload Endpoint (Updated)
```typescript
POST /api/users/me/avatar
Content-Type: multipart/form-data

// Upload avatar lên R2 thay vì lưu base64
// Tự động xóa avatar cũ khi upload mới
```

### 3. Configuration

#### wrangler.toml
```toml
# Development
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "store-uploads"

# Production
[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "store-uploads-production"
```

#### Environment Type
```typescript
interface Environment {
  STORAGE: R2Bucket;
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
}
```

## 🚀 Cách sử dụng

### Upload Avatar (Đã có)

Frontend tự động sử dụng endpoint mới:
```typescript
// File: frontend/src/services/auth-service.ts
async uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/users/me/avatar', formData);
  return response.data;
}
```

### Upload Product Images (Sẽ implement)

Để thêm upload cho product images:

```typescript
// Backend: /routes/product.routes.ts
import { createUploadService } from '@/utils/upload';

// POST /api/products/:id/image
const formData = await request.formData();
const imageFile = formData.get('image') as File;

const uploadService = createUploadService(env);
const result = await uploadService.uploadFile(imageFile, {
  folder: 'products',
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 5 * 1024 * 1024, // 5MB
});

// Save result.url to database
```

Frontend:
```typescript
// File: frontend/src/services/product-service.ts
async uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post(`/products/${productId}/image`, formData);
  return response.data;
}
```

## 📁 File Structure trong R2

```
store-uploads/
├── avatars/
│   ├── 1731765200000-abc123.jpg
│   ├── 1731765300000-def456.png
│   └── ...
├── products/
│   ├── 1731765400000-ghi789.jpg
│   └── ...
└── other-folders/
    └── ...
```

## 🔒 Security & Validation

Upload Service tự động validate:
- ✅ **File Type**: Chỉ cho phép image types
- ✅ **File Size**: Max 5MB (có thể tùy chỉnh)
- ✅ **Unique Names**: Tự động tạo tên file unique
- ✅ **Folder Organization**: Phân loại theo folder

## 🌐 URL Format

Files được serve qua endpoint:
```
Development:
http://localhost:8787/api/storage/avatars/1731765200000-abc123.jpg

Production:
https://store-backend.stock-dev.workers.dev/api/storage/avatars/1731765200000-abc123.jpg

Production (custom):
https://store-backend-production.stock-dev.workers.dev/api/storage/avatars/1731765200000-abc123.jpg
```

## 📊 Ưu điểm so với Base64

| Feature | Base64 | R2 Storage |
|---------|--------|------------|
| Database size | ❌ Rất lớn | ✅ Nhỏ gọn |
| Performance | ❌ Chậm | ✅ Nhanh |
| Bandwidth | ❌ Cao | ✅ Thấp |
| Cost | ❌ Đắt | ✅ Rẻ |
| CDN | ❌ Không | ✅ Có |
| Caching | ❌ Khó | ✅ Dễ |
| Scalability | ❌ Hạn chế | ✅ Vô hạn |

## 🧪 Testing

### Test Avatar Upload
1. Mở http://localhost:3001
2. Login vào account
3. Vào Profile page
4. Click "Change Avatar"
5. Chọn một image file (< 5MB)
6. Click "Upload"
7. Kiểm tra:
   - Avatar hiển thị đúng
   - URL có format `/api/storage/avatars/...`
   - File tồn tại trong R2

### Test File Access
```bash
# Get file từ R2
curl http://localhost:8787/api/storage/avatars/1731765200000-abc123.jpg

# Hoặc mở trong browser
open http://localhost:8787/api/storage/avatars/1731765200000-abc123.jpg
```

## 🔧 Quản lý R2 Buckets

### List buckets
```bash
npx wrangler r2 bucket list
```

### List objects in bucket
```bash
npx wrangler r2 object list --bucket store-uploads
```

### Delete object
```bash
npx wrangler r2 object delete --bucket store-uploads --key avatars/filename.jpg
```

## 📝 Next Steps

### Để implement upload cho Product Images:

1. **Backend**: Tạo endpoint trong `product.routes.ts`
   ```typescript
   POST /api/products/:id/image
   DELETE /api/products/:id/image
   ```

2. **Frontend**: Thêm upload UI trong Admin panel
   ```typescript
   // Trong ProductForm component
   <input type="file" @change="handleImageSelect" />
   <button @click="uploadImage">Upload Image</button>
   ```

3. **Database**: Cập nhật product schema nếu cần
   ```sql
   -- Nếu chưa có imageUrl column
   ALTER TABLE products ADD COLUMN imageUrl TEXT;
   ```

4. **Multiple Images**: Nếu cần nhiều ảnh cho 1 product
   ```typescript
   // Có thể lưu array of URLs trong JSON column
   // Hoặc tạo bảng product_images riêng
   ```

## 🎯 Tips

1. **Compression**: Nén ảnh trước khi upload để tiết kiệm bandwidth
2. **Thumbnails**: Tạo thumbnail khi upload (resize image)
3. **WebP Format**: Convert sang WebP để giảm file size
4. **Lazy Loading**: Load images khi cần thiết
5. **CDN**: Sử dụng Cloudflare CDN để cache images

## 🐛 Troubleshooting

### Error: "Failed to upload file"
- Kiểm tra R2 bucket đã được tạo
- Kiểm tra wrangler.toml config
- Kiểm tra file size < max size
- Kiểm tra file type được phép

### Error: "File not found"
- Kiểm tra file path đúng format
- Kiểm tra file đã được upload thành công
- Kiểm tra R2 bucket binding

### Images không load
- Kiểm tra CORS headers
- Kiểm tra URL format
- Kiểm tra network requests trong DevTools

## 📚 References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Workers R2 Bindings](https://developers.cloudflare.com/workers/runtime-apis/r2/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
