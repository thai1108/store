#!/bin/bash

# Test Product Creation with Variants and Images
# Requires: jq for JSON parsing

BACKEND_URL="http://localhost:8787"
ADMIN_TOKEN="your-admin-token-here"

echo "🧪 Testing Product Creation with Variants & Images..."

# 1. Test simple product (no variants, no images)
echo ""
echo "1️⃣ Creating simple product..."
curl -X POST "$BACKEND_URL/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Simple Product",
    "description": "A simple product without variants",
    "price": 50000,
    "category": "snack",
    "inStock": true
  }' | jq .

# 2. Test product with variants only
echo ""
echo "2️⃣ Creating product with variants..."
curl -X POST "$BACKEND_URL/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "T-Shirt with Sizes",
    "description": "Product with different sizes",
    "price": 200000,
    "category": "snack",
    "inStock": true,
    "variants": [
      {"size": "M", "stock": 50, "priceAdjustment": 0},
      {"size": "L", "stock": 30, "priceAdjustment": 10000},
      {"size": "XL", "stock": 20, "priceAdjustment": 20000}
    ]
  }' | jq .

# 3. Test product with images only
echo ""
echo "3️⃣ Creating product with images..."
curl -X POST "$BACKEND_URL/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Product with Images",
    "description": "Product with multiple images",
    "price": 100000,
    "category": "drink",
    "inStock": true,
    "images": [
      {"imageUrl": "https://via.placeholder.com/300x300?text=Image1", "displayOrder": 0},
      {"imageUrl": "https://via.placeholder.com/300x300?text=Image2", "displayOrder": 1},
      {"imageUrl": "https://via.placeholder.com/300x300?text=Image3", "displayOrder": 2}
    ]
  }' | jq .

# 4. Test product with both variants and images
echo ""
echo "4️⃣ Creating product with variants AND images..."
curl -X POST "$BACKEND_URL/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Complete Product",
    "description": "Product with everything",
    "price": 300000,
    "category": "milk-tea",
    "inStock": true,
    "variants": [
      {"size": "S", "stock": 100, "priceAdjustment": -5000},
      {"size": "M", "stock": 80, "priceAdjustment": 0},
      {"size": "L", "stock": 50, "priceAdjustment": 10000}
    ],
    "images": [
      {"imageUrl": "https://via.placeholder.com/300x300?text=Front", "displayOrder": 0},
      {"imageUrl": "https://via.placeholder.com/300x300?text=Back", "displayOrder": 1}
    ]
  }' | jq .

echo ""
echo "✅ Tests completed!"
