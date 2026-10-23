@echo off
REM Serve the Maize Seed Classifier web app on http://localhost:8080/
cd /d "%~dp0deploy"
python serve.py
