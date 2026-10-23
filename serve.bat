@echo off
REM Serve the Seed Classifier web app on http://localhost:8080/
cd /d "%~dp0"
python tools\serve_deploy.py
