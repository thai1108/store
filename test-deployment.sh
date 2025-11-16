#!/bin/bash

# Post-Deployment Testing Script
# Test your deployed application

echo "🧪 Testing Deployed Application"
echo "================================"
echo ""

# Check if required commands exist
if ! command -v curl &> /dev/null; then
    echo "❌ curl is required but not installed"
    exit 1
fi

# Get the URLs
read -p "Enter your Backend URL (e.g., https://store-backend.abc123.workers.dev): " BACKEND_URL
read -p "Enter your Frontend URL (e.g., https://store-frontend.pages.dev): " FRONTEND_URL

echo ""
echo "🔍 Testing Backend API..."
echo "================================"

# Test health check (if you have one)
echo "1. Testing API accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/products")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ API is accessible (HTTP $HTTP_CODE)"
else
    echo "   ❌ API returned HTTP $HTTP_CODE"
fi

# Test products endpoint
echo ""
echo "2. Testing products endpoint..."
PRODUCTS=$(curl -s "$BACKEND_URL/api/products")
if [ ! -z "$PRODUCTS" ]; then
    echo "   ✅ Products endpoint working"
    echo "   Response: ${PRODUCTS:0:100}..."
else
    echo "   ❌ Products endpoint failed"
fi

# Test CORS
echo ""
echo "3. Testing CORS headers..."
CORS_HEADER=$(curl -s -I "$BACKEND_URL/api/products" | grep -i "access-control-allow-origin")
if [ ! -z "$CORS_HEADER" ]; then
    echo "   ✅ CORS headers present"
    echo "   $CORS_HEADER"
else
    echo "   ⚠️  CORS headers not found (might be an issue)"
fi

echo ""
echo "🌐 Testing Frontend..."
echo "================================"

# Test frontend accessibility
echo "1. Testing frontend accessibility..."
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_CODE" -eq 200 ]; then
    echo "   ✅ Frontend is accessible (HTTP $FRONTEND_CODE)"
else
    echo "   ❌ Frontend returned HTTP $FRONTEND_CODE"
fi

# Check if index.html exists
echo ""
echo "2. Testing frontend content..."
FRONTEND_CONTENT=$(curl -s "$FRONTEND_URL")
if echo "$FRONTEND_CONTENT" | grep -q "<!DOCTYPE html>"; then
    echo "   ✅ Frontend HTML is serving correctly"
else
    echo "   ❌ Frontend HTML not found"
fi

echo ""
echo "📋 Manual Testing Checklist"
echo "================================"
echo "Please manually test the following:"
echo ""
echo "Frontend ($FRONTEND_URL):"
echo "  [ ] Homepage loads correctly"
echo "  [ ] Products page shows items"
echo "  [ ] Can add items to cart"
echo "  [ ] Can view cart"
echo "  [ ] Can register new account"
echo "  [ ] Can login"
echo "  [ ] Can place order"
echo "  [ ] Can view order history"
echo "  [ ] Can update profile"
echo "  [ ] Language switcher works (EN/VI)"
echo ""
echo "Admin Features (if applicable):"
echo "  [ ] Can access admin panel"
echo "  [ ] Can manage products"
echo "  [ ] Can view orders"
echo ""
echo "Backend API ($BACKEND_URL/api):"
echo "  [ ] GET /api/products - Returns product list"
echo "  [ ] POST /api/users/register - Registers new user"
echo "  [ ] POST /api/users/login - Authenticates user"
echo "  [ ] POST /api/orders - Creates order"
echo "  [ ] GET /api/users/me/orders - Returns user orders"
echo ""
echo "🎉 Testing Complete!"
echo ""
echo "If all checks passed, your application is successfully deployed! 🚀"
echo ""
