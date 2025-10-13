@echo off
cd /d "C:\Users\sanga\Downloads\SATHWIK\Documents\health-beacon-guide\backend-fastapi"
call .venv\Scripts\activate.bat

echo Loading environment variables from .env file...
set GEMINI_API_KEY=AIzaSyDbhN_-DZMeH308shcS928_BDbeejpnK-o
set GEMINI_MODEL=gemini-2.5-flash
echo GEMINI_API_KEY: SET
echo GEMINI_MODEL: %GEMINI_MODEL%

echo Starting server with error capture...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --log-level debug