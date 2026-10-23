@echo off
REM Serve the app from this folder on http://localhost:8080/
cd /d "%~dp0"
python serve.py
