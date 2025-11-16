# 📝 Deployment Commands Cheat Sheet

Quick reference for all deployment commands.

## 🔐 Authentication

```bash
# Login to Cloudflare
wrangler login

# Check who is logged in
wrangler whoami

# Logout
wrangler logout
```

## 💾 Database Commands

```bash
# Create production database
wrangler d1 create store-db-production

# List all databases
wrangler d1 list

# Execute SQL file
wrangler d1 execute DB_NAME --file=schema.sql --env production

# Execute SQL command
wrangler d1 execute DB_NAME --command="SELECT * FROM users;" --env production

# Query database (interactive)
wrangler d1 query DB_NAME --env production
```

## 🚀 Backend Deployment

```bash
# Deploy to production
cd backend
npm run deploy -- --env production

# Deploy with specific version/tag
npm run deploy -- --env production --tag v1.0.0

# Deploy and tail logs immediately
npm run deploy -- --env production && wrangler tail store-backend --env production
```

## 🌐 Frontend Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=store-frontend

# Deploy with custom branch name
wrangler pages deploy dist --project-name=store-frontend --branch=production

# Deploy with commit message
wrangler pages deploy dist --project-name=store-frontend --commit-message="Deploy v1.0.0"
```

## 📊 Monitoring Commands

```bash
# Tail backend logs (real-time)
wrangler tail store-backend --env production

# Tail with filter
wrangler tail store-backend --env production --search "error"

# Tail with specific format
wrangler tail store-backend --env production --format json

# List deployments
wrangler deployments list

# View deployment details
wrangler deployments view [deployment-id]
```

## 🔄 Rollback Commands

```bash
# List recent deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback [deployment-id]

# Rollback to specific version
wrangler rollback --version-id [version-id]
```

## 🧪 Testing Commands

```bash
# Test backend locally
cd backend
npm run dev

# Test specific endpoint with curl
curl https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/products

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/users/me

# Run test script
./test-deployment.sh
```

## 🔧 Configuration Commands

```bash
# View current configuration
cd backend
cat wrangler.toml

# Update environment variables
wrangler secret put JWT_SECRET --env production

# List all secrets
wrangler secret list --env production

# Delete a secret
wrangler secret delete SECRET_NAME --env production
```

## 📦 Project Management

```bash
# Create new Pages project
wrangler pages project create store-frontend

# List Pages projects
wrangler pages project list

# View project info
wrangler pages project info store-frontend

# Delete project
wrangler pages project delete store-frontend
```

## 🌍 Domain Management

```bash
# Add custom domain to Worker
# (Do this via Cloudflare Dashboard)

# Add custom domain to Pages
wrangler pages domains add DOMAIN --project-name=store-frontend

# List domains
wrangler pages domains list --project-name=store-frontend

# Remove domain
wrangler pages domains remove DOMAIN --project-name=store-frontend
```

## 🎯 Complete Deployment Workflow

```bash
# 1. Setup
wrangler login
cd backend
wrangler d1 create store-db-production

# 2. Update wrangler.toml with database_id
# Edit backend/wrangler.toml

# 3. Initialize database
wrangler d1 execute store-db-production --file=schema.sql --env production
wrangler d1 execute store-db-production --file=sample-data.sql --env production

# 4. Deploy backend
npm run deploy -- --env production

# 5. Note Worker URL and update frontend config
# Edit frontend/.env.production

# 6. Deploy frontend
cd ../frontend
npm run build
wrangler pages deploy dist --project-name=store-frontend

# 7. Test deployment
cd ..
./test-deployment.sh

# 8. Monitor logs
wrangler tail store-backend --env production
```

## 🔄 Update Deployment Workflow

```bash
# Update backend
cd backend
git pull
npm install
npm run deploy -- --env production

# Update frontend
cd frontend
git pull
npm install
npm run build
wrangler pages deploy dist --project-name=store-frontend

# Verify update
curl https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/products
```

## 🐛 Debugging Commands

```bash
# Check Worker status
wrangler tail store-backend --env production

# Check database connection
wrangler d1 execute store-db-production \
  --command="SELECT COUNT(*) as count FROM products;" \
  --env production

# Test API endpoint with verbose output
curl -v https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/products

# Check Pages deployment logs
# (View in Cloudflare Dashboard → Pages → Deployments)

# Test frontend build locally
cd frontend
npm run build
npm run preview
```

## 📋 Pre-Deployment Checklist Commands

```bash
# 1. Check if logged in
wrangler whoami

# 2. Verify Node.js version
node --version  # Should be v16+

# 3. Verify npm version
npm --version

# 4. Check if all dependencies installed
cd backend && npm list
cd frontend && npm list

# 5. Test local development
cd backend && npm run dev &
cd frontend && npm run dev &

# 6. Kill local servers
killall node
```

## 🎛️ Environment Management

```bash
# View current environment
wrangler env list

# Deploy to specific environment
wrangler deploy --env staging
wrangler deploy --env production

# View environment variables
wrangler secret list --env production

# Set environment-specific variable
wrangler secret put API_KEY --env production
wrangler secret put API_KEY --env staging
```

## 📊 Analytics Commands

```bash
# View analytics (via Dashboard)
# Dashboard → Workers & Pages → Analytics

# Or use GraphQL API
wrangler analytics list --accountId YOUR_ACCOUNT_ID
```

## 🔐 Security Commands

```bash
# Rotate JWT secret
wrangler secret put JWT_SECRET --env production

# Update CORS settings
# Edit backend/utils/cors.ts and redeploy

# View security headers
curl -I https://store-frontend.pages.dev
```

## 💡 Quick Tips

```bash
# Deploy everything with one script
./deploy-all.sh

# Deploy only backend
./deploy-backend.sh

# Deploy only frontend
./deploy-frontend.sh

# Test after deployment
./test-deployment.sh

# View all git changes before deploy
git status
git diff

# Create deployment tag
git tag -a v1.0.0 -m "Production deployment v1.0.0"
git push origin v1.0.0
```

## 🆘 Emergency Commands

```bash
# Quick rollback
wrangler deployments list
wrangler rollback [previous-deployment-id]

# Stop receiving traffic (set to maintenance)
# Temporarily disable Worker via Dashboard

# Check service status
curl https://store-backend.YOUR_SUBDOMAIN.workers.dev/api/health

# Emergency database backup
wrangler d1 execute store-db-production \
  --command="SELECT * FROM products;" \
  --env production > backup-products.json
```

## 📚 Help Commands

```bash
# General help
wrangler --help

# Command-specific help
wrangler d1 --help
wrangler pages --help
wrangler deploy --help

# Version
wrangler --version
```

---

💡 **Pro Tip:** Save this file for quick reference during deployments!

🔖 **Bookmark These:**
- Cloudflare Dashboard: https://dash.cloudflare.com
- Workers Docs: https://developers.cloudflare.com/workers/
- Pages Docs: https://developers.cloudflare.com/pages/
