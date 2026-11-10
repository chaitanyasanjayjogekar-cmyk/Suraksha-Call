@echo off
echo ============================================
echo   SURAKSHA CALL - Backend Startup
echo   Scam ko number se nahi, baaton se pehchano
echo ============================================
echo.

cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting Suraksha Call Backend...
echo API Docs: http://localhost:8000/api/docs
echo Health:   http://localhost:8000/api/health
echo.
python main.py
