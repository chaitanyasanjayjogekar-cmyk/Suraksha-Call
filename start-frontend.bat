@echo off
echo ============================================
echo   SURAKSHA CALL - Frontend Startup
echo ============================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing frontend packages...
    npm install
)

echo Starting Suraksha Call Frontend...
echo Open: http://localhost:5173
echo.
npm run dev
