#!/bin/bash

# Complete Deployment Script
# Deploys both backend and frontend to Cloudflare

set -e

echo "🚀 Starting Complete Deployment to Cloudflare..."
echo ""

# Step 1: Deploy Backend
echo "======================================"
echo "STEP 1: Deploying Backend"
echo "======================================"
./deploy-backend.sh

echo ""
read -p "✅ Backend deployed. Press Enter to continue with frontend deployment..."
echo ""

# Step 2: Deploy Frontend
echo "======================================"
echo "STEP 2: Deploying Frontend"
echo "======================================"
./deploy-frontend.sh

echo ""
echo "🎉 Complete deployment finished!"
echo ""
echo "📋 Your application is now live:"
echo "- Backend API: Check the Worker URL from deployment output"
echo "- Frontend: https://store-frontend.pages.dev"
echo ""
