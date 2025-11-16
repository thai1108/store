#!/bin/bash

# Deploy Backend to Cloudflare Workers
# This script deploys the backend API to Cloudflare Workers

set -e

echo "🚀 Deploying Backend to Cloudflare Workers..."

cd "$(dirname "$0")/backend"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "📝 Please login to Cloudflare..."
    wrangler login
fi

# Build and deploy
echo "📦 Building and deploying backend..."
npm run deploy -- --env production

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Note your Worker URL (e.g., https://store-backend.YOUR_SUBDOMAIN.workers.dev)"
echo "2. Update frontend/.env.production with your Worker URL"
echo "3. Run ./deploy-frontend.sh to deploy the frontend"
echo ""
