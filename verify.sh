#!/bin/bash

echo "🧋 TeaStore - Verification Script"
echo "================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

# Check if servers are running
print_status "Checking if backend server is running on port 8787..."
if curl -s http://localhost:8787/api/health > /dev/null; then
    print_success "Backend server is running"
else
    print_error "Backend server is not running. Start with: cd backend && wrangler dev"
    exit 1
fi

print_status "Checking if frontend server is running on port 3000..."
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend server is running"
else
    print_error "Frontend server is not running. Start with: cd frontend && npm run dev"
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Health check
HEALTH_RESPONSE=$(curl -s http://localhost:8787/api/health)
if [[ $HEALTH_RESPONSE == *"success"* ]]; then
    print_success "Health endpoint working"
else
    print_error "Health endpoint failed"
fi

# Products endpoint
PRODUCTS_RESPONSE=$(curl -s http://localhost:8787/api/products)
if [[ $PRODUCTS_RESPONSE == *"success"* ]]; then
    print_success "Products endpoint working"
else
    print_error "Products endpoint failed"
fi

# Database check
print_status "Checking database connection..."
DB_CHECK=$(curl -s http://localhost:8787/api/products | grep -o '"data":\[[^]]*\]' | wc -c)
if [ "$DB_CHECK" -gt 10 ]; then
    print_success "Database connection and sample data OK"
else
    print_error "Database issue - no sample data found"
fi

echo ""
echo "🎉 Verification Complete!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8787"
echo ""
echo "Available API endpoints:"
echo "• GET /api/health - Health check"
echo "• GET /api/products - List products"
echo "• POST /api/users/register - Register user"
echo "• POST /api/users/login - Login user"
echo "• POST /api/orders - Create order"
echo ""
echo "Sample users (for testing login):"
echo "• Admin: admin@teatstore.com / admin123"
echo "• Customer: customer@teatstore.com / customer123"
echo ""
echo "✨ Happy testing! The application is ready to use."