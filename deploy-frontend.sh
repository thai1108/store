#!/bin/bash

# Deploy Frontend to Cloudflare Pages
# This script builds and deploys the frontend to Cloudflare Pages

set -e

echo "🚀 Deploying Frontend to Cloudflare Pages..."

cd "$(dirname "$0")/frontend"

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

# Check if .env.production is configured
if grep -q "YOUR_SUBDOMAIN" .env.production; then
    echo "⚠️  Warning: .env.production still contains YOUR_SUBDOMAIN"
    echo "Please update .env.production with your actual Worker URL"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Deploy to Cloudflare Pages
echo "📤 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=store-frontend

echo ""
echo "✅ Frontend deployed successfully!"
echo ""
echo "📋 Your site should be available at:"
echo "https://store-frontend.pages.dev"
echo ""
