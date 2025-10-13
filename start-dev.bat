@echo off
REM Development script for Health Beacon Guide (Windows)

echo 🚀 Starting Health Beacon Guide Frontend...
echo.

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Start development server
echo 🌟 Starting development server...
echo 📍 Access your app at: http://localhost:8080/
echo
npm run dev