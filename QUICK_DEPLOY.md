# 🚀 Quick Deployment Guide

## TL;DR - Deploy in 5 Minutes

### Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Step 1: Create Production Database
```bash
cd backend
wrangler d1 create store-db-production
```

Copy the `database_id` and update it in `backend/wrangler.toml`:
```toml
[[env.production.d1_databases]]
database_id = "YOUR_DATABASE_ID_HERE"  # Replace this
```

### Step 2: Setup Database
```bash
# Apply schema
wrangler d1 execute store-db-production --file=schema.sql --env production

# Add sample data (optional)
wrangler d1 execute store-db-production --file=sample-data.sql --env production
```

### Step 3: Deploy Backend
```bash
./deploy-backend.sh
```

Copy your Worker URL (e.g., `https://store-backend.abc123.workers.dev`)

### Step 4: Configure Frontend
Edit `frontend/.env.production`:
```env
VITE_API_URL=https://store-backend.YOUR_SUBDOMAIN.workers.dev/api
```

### Step 5: Deploy Frontend
```bash
./deploy-frontend.sh
```

### Done! 🎉
Your app is now live at:
- **Frontend:** `https://store-frontend.pages.dev`
- **Backend:** `https://store-backend.YOUR_SUBDOMAIN.workers.dev`

---

## Auto Deployment

Want to deploy everything at once?
```bash
./deploy-all.sh
```

---

## Update Deployment

### Update Backend:
```bash
cd backend
npm run deploy -- --env production
```

### Update Frontend:
```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=store-frontend
```

---

## View Logs

```bash
# Backend logs
wrangler tail store-backend --env production

# Frontend deployment logs
# Check in Cloudflare Dashboard → Pages → store-frontend
```

---

## Need More Help?

See detailed guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Troubleshooting

**API not connecting?**
- Check `VITE_API_URL` in `frontend/.env.production`
- Rebuild frontend: `npm run build`

**Database errors?**
- Verify `database_id` in `wrangler.toml`
- Check if schema was applied correctly

**Deployment failed?**
- Run `wrangler login` again
- Delete `node_modules` and reinstall: `npm install`

---

## Cost

**Free Tier Includes:**
- 100,000 requests/day on Workers
- Unlimited requests on Pages
- 5GB D1 database storage

Perfect for small to medium projects! 💰
