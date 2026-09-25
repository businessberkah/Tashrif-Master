@echo off
title Asy-Syafee Web Server
cd /d "%~dp0"
set QUTRUB_DB_BASE=%~dp0
set QUTRUB_DEBUG=0
set PYTHONIOENCODING=utf-8
set PYTHON=D:\python-embed\python311\python.exe

if not exist "%PYTHON%" (
    set PYTHON=python
)

echo Menjalankan Asy-Syafee Web Server di http://localhost:5000 ...
"%PYTHON%" interfaces\web\qutrub_webserver.py
pause