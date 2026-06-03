@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo  RAG Assistant - No Database Required
echo ================================================
echo.

REM Check OPENAI_API_KEY
if "%OPENAI_API_KEY%"=="" (
    echo WARNING: OPENAI_API_KEY not set!
    echo Please set it:
    echo   set OPENAI_API_KEY=sk-your-key-here
    echo Or edit server\.env file
    echo.
)

REM Start backend
echo Starting backend server on http://localhost:5000...
start "RAG Backend" cmd /k "cd server && node indexSimple.js"

REM Wait a bit for backend to start
timeout /t 2 /nobreak

REM Start frontend
echo Starting frontend server on http://localhost:5173...
start "RAG Frontend" cmd /k "cd client && npm run dev"

echo.
echo ================================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo ================================================
echo.
echo Windows will open two new command windows.
echo Close them when done (or press Ctrl+C).
echo.
