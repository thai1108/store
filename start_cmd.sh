# 1. Chạy setup script
./setup.sh

# 2. Login Cloudflare
cd backend
wrangler login

# 3. Tạo resources (chỉ cần làm 1 lần)
wrangler d1 create store-db
wrangler kv:namespace create ORDER_CACHE
wrangler r2 bucket create store-images

# 4. Update IDs trong wrangler.toml

# 5. Setup database
wrangler d1 execute store-db --file=./schema.sql
wrangler d1 execute store-db --file=./sample-data.sql

# 6. Start development
./start-dev.sh