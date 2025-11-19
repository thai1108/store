#!/bin/bash

echo "🧪 Testing order creation with variant..."
echo ""
echo "Step 1: Login to get token..."

# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@store.com",
    "password": "admin123"
  }' > /tmp/login_response.json

echo ""
echo "Login response saved. Please copy the token and run:"
echo ""
echo "curl -X POST http://localhost:8787/api/orders \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "  -d '{"
echo "    \"items\": ["
echo "      {"
echo "        \"productId\": \"1\","
echo "        \"variantId\": \"2\","
echo "        \"quantity\": 2"
echo "      }"
echo "    ],"
echo "    \"customerInfo\": {"
echo "      \"name\": \"Test User\","
echo "      \"phone\": \"0123456789\""
echo "    }"
echo "  }'"
echo ""
echo "Or open the frontend and make an order!"
