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
