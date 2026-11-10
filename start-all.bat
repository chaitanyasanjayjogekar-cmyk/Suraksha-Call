@echo off
echo ============================================
echo   SURAKSHA CALL - Full Stack Startup
echo ============================================
echo.
echo Starting Backend in background...
start "Suraksha Backend" cmd /k "cd /d backend && (if not exist venv\Scripts\activate.bat python -m venv venv) && venv\Scripts\activate.bat && pip install -r requirements.txt --quiet && python main.py"

timeout /t 4 /nobreak > nul

echo Starting Frontend...
start "Suraksha Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both services starting...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/api/docs
echo.
pause
