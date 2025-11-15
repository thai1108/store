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
