#!/bin/bash
set -e

echo "🚀 Starting Health Beacon Application..."

# Determine which service to run based on environment
if [ "$SERVICE_TYPE" = "backend" ]; then
    echo "📦 Starting Backend Service on port 8002..."
    cd backend-fastapi
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
elif [ "$SERVICE_TYPE" = "frontend" ]; then
    echo "🎨 Starting Frontend Service on port 3000..."
    cd frontend
    npm run preview -- --host 0.0.0.0 --port 3000
else
    # Default: Start full stack if both SERVICE_TYPE not specified
    echo "🔄 Starting both Backend and Frontend services..."
    
    # Start backend in background
    echo "📦 Starting Backend on port 8002..."
    cd backend-fastapi
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 &
    BACKEND_PID=$!
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend
    cd ../frontend
    echo "🎨 Starting Frontend on port 3000..."
    npm run preview -- --host 0.0.0.0 --port 3000
    
    # Wait for both processes
    wait $BACKEND_PID
fi
