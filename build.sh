#!/bin/bash
set -e

echo "🔨 Building Health Beacon Application..."

# Build Backend
echo "📦 Setting up Backend..."
cd backend-fastapi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || . venv/Scripts/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

cd ..

# Build Frontend
echo "🎨 Building Frontend..."
cd frontend

# Install Node dependencies
echo "Installing Node dependencies..."
npm ci

# Build frontend for production
echo "Building frontend production bundle..."
npm run build

cd ..

echo "✅ Build completed successfully!"
echo "Frontend built to: frontend/dist"
echo "Backend ready at: backend-fastapi"
