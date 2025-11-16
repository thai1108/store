# 🔧 Fix: Avatar Upload URL - Production

## Vấn đề
Production endpoint trả về localhost URL thay vì production URL:
```json
{
  "avatarUrl": "http://localhost:8787/api/storage/avatars/xxx.jpg"
}
```

## Nguyên nhân
`createUploadService()` dùng `env.ENVIRONMENT` để xác định base URL, nhưng biến này không được set đúng.

## Giải pháp ✅

Thay vì dùng environment variable, detect URL từ request:

```typescript
// Before
export function createUploadService(env: Environment): UploadService {
  const baseUrl = env.ENVIRONMENT === 'production' 
    ? 'https://store-backend.stock-dev.workers.dev/api/storage'
    : 'http://localhost:8787/api/storage';
  return new UploadService(env.STORAGE, baseUrl);
}

// After
export function createUploadService(env: Environment, request: Request): UploadService {
  // Auto-detect from request URL
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}/api/storage`;
  return new UploadService(env.STORAGE, baseUrl);
}
```

## Kết quả

Bây giờ sẽ tự động trả về đúng URL:
- Dev: `http://localhost:8787/api/storage/avatars/xxx.jpg`
- Production: `https://store-backend-production.stock-dev.workers.dev/api/storage/avatars/xxx.jpg`

## Deploy ✅
- ✅ Backend dev deployed
- ✅ Backend production deployed (Version: a26dc563-3c43-4035-912c-36572d97df60)

## Test
Upload avatar ở production sẽ trả về đúng URL production!
