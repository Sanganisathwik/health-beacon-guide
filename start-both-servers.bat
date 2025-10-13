@echo off
echo Starting Health Beacon Guide servers...

echo.
echo Starting Backend API Server on port 8002...
start "Health Beacon Backend" cmd /k "cd /d backend-fastapi && .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload"

timeout /t 3

echo.
echo Starting Frontend Development Server...
start "Health Beacon Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend API: http://localhost:8002
echo Frontend App: http://localhost:8081 (or next available port)
echo API Documentation: http://localhost:8002/docs
echo.
echo Press any key to exit...
pause