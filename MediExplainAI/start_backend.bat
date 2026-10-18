@echo off
title MediExplain AI - Backend Server
echo ========================================================
echo Starting MediExplain AI FastAPI Backend Server...
echo Host: http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0"
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
