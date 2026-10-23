@echo off
REM Serve the Seed Classifier app from the deploy folder on http://localhost:8080/
cd /d "%~dp0.."
python tools\serve_deploy.py
