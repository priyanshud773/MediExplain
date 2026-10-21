@echo off
title MediExplain AI - Full Stack Launcher
echo ========================================================
echo Starting MediExplain AI (Backend + Frontend)
echo ========================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "MediExplain AI - Backend" cmd /k "cd /d "%~dp0MediExplainAI" && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "MediExplain AI - Frontend" cmd /k "cd /d "%~dp0mediexplain-frontend" && npm run dev"

echo ========================================================
echo Both servers have been launched in separate windows!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo ========================================================
pause