#!/bin/bash

# Test creating order with variant
echo "🧪 Testing order creation with variant..."

# First, login to get token
echo "1. Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@store.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo "✅ Logged in, token: ${TOKEN:0:20}..."

# Create order with variant
echo ""
echo "2. Creating order with variant (productId=1, variantId=2)..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "1",
        "variantId": "2",
        "quantity": 2
      }
    ],
    "customerInfo": {
      "name": "Test User",
      "phone": "0123456789",
      "email": "test@test.com",
      "address": "123 Test St"
    },
    "notes": "Test order with variant"
  }')

echo "$ORDER_RESPONSE" | jq .

# Check if successful
SUCCESS=$(echo $ORDER_RESPONSE | jq -r '.success')
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id')

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "✅ Order created successfully! Order ID: $ORDER_ID"
  echo ""
  echo "3. Checking database..."
  cd backend
  wrangler d1 execute store-db --local --command "SELECT * FROM order_items WHERE orderId = $ORDER_ID"
else
  echo ""
  echo "❌ Order creation failed"
  exit 1
fi
