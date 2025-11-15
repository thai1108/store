#!/bin/bash

echo "🧋 Setting up TeaStore project..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install Wrangler CLI globally if not exists
if ! command -v wrangler &> /dev/null; then
    print_status "Installing Wrangler CLI..."
    npm install -g wrangler
    print_success "Wrangler CLI installed"
else
    print_status "Wrangler CLI already installed: $(wrangler --version)"
fi

# Setup Backend
print_status "Setting up backend..."
cd backend || exit 1

if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
else
    print_status "Backend dependencies already installed"
fi

# Setup Frontend
print_status "Setting up frontend..."
cd ../frontend || exit 1

if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed"
fi

cd ..

# Create environment files
print_status "Creating environment configuration..."

if [ ! -f "backend/.dev.vars" ]; then
    cat > backend/.dev.vars << EOF
# Development environment variables
ENVIRONMENT=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
    print_success "Created backend/.dev.vars"
fi

if [ ! -f "frontend/.env.development" ]; then
    cat > frontend/.env.development << EOF
# Frontend development environment
VITE_API_URL=http://localhost:8787
VITE_APP_NAME=TeaStore
EOF
    print_success "Created frontend/.env.development"
fi

# Create run scripts
print_status "Creating run scripts..."

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🧋 Starting TeaStore development servers..."

# Function to run commands in background
run_bg() {
    echo "Starting $1..."
    $2 &
    echo $! > "$1.pid"
}

# Start backend
cd backend
run_bg "backend" "npm run dev"
cd ..

# Start frontend  
cd frontend
run_bg "frontend" "npm run dev"
cd ..

echo "✅ Both servers started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8787"
echo ""
echo "To stop servers, run: ./stop-dev.sh"
EOF

cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping TeaStore development servers..."

# Function to stop process
stop_process() {
    if [ -f "$1.pid" ]; then
        PID=$(cat "$1.pid")
        if ps -p $PID > /dev/null; then
            kill $PID
            echo "Stopped $1 (PID: $PID)"
        fi
        rm "$1.pid"
    else
        echo "$1 is not running"
    fi
}

stop_process "backend"
stop_process "frontend"

echo "✅ All servers stopped!"
EOF

chmod +x start-dev.sh
chmod +x stop-dev.sh

print_success "Created development scripts"

# Create sample products SQL
print_status "Creating sample data..."

cat > backend/sample-data.sql << EOF
-- Sample products for testing
INSERT INTO products (id, name, description, price, category, imageUrl, inStock, createdAt, updatedAt) VALUES
('prod-1', 'Bubble Milk Tea', 'Classic bubble tea with chewy tapioca pearls', 45000, 'milk-tea', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=300', 1, datetime('now'), datetime('now')),
('prod-2', 'Taro Milk Tea', 'Creamy taro flavored milk tea with a purple twist', 50000, 'milk-tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', 1, datetime('now'), datetime('now')),
('prod-3', 'Green Tea Latte', 'Smooth green tea with steamed milk', 40000, 'drink', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300', 1, datetime('now'), datetime('now')),
('prod-4', 'Potato Chips', 'Crispy salted potato chips', 25000, 'snack', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', 1, datetime('now'), datetime('now')),
('prod-5', 'Chocolate Cookies', 'Homemade chocolate chip cookies', 35000, 'snack', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300', 1, datetime('now'), datetime('now')),
('prod-6', 'Iced Coffee', 'Cold brew coffee with ice', 30000, 'drink', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', 1, datetime('now'), datetime('now'));

-- Sample admin user (password: admin123)
INSERT INTO users (id, email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES
('user-admin', 'admin@teatstore.com', 'Admin User', '+84123456789', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', datetime('now'), datetime('now'));

-- Sample customer user (password: customer123)  
INSERT INTO users (id, email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES
('user-customer', 'customer@teatstore.com', 'Customer User', '+84987654321', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', 'customer', datetime('now'), datetime('now'));
EOF

print_success "Created sample data file"

print_success "🎉 Setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Login to Cloudflare: wrangler login"
print_status "2. Create D1 database: cd backend && wrangler d1 create store-db"
print_status "3. Create KV namespace: wrangler kv:namespace create ORDER_CACHE"
print_status "4. Create R2 bucket: wrangler r2 bucket create store-images"
print_status "5. Update wrangler.toml with the generated IDs"
print_status "6. Initialize database: wrangler d1 execute store-db --file=./schema.sql"
print_status "7. Add sample data: wrangler d1 execute store-db --file=./sample-data.sql"
print_status "8. Start development: ./start-dev.sh"
print_status ""
print_status "📖 Read README.md for detailed instructions"
print_status ""
print_success "Happy coding! 🚀"