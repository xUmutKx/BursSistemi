@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Burs Sistemi
if exist runtime\win\node.exe (set NODE=runtime\win\node.exe) else (set NODE=node)
start "" /min cmd /c "timeout /t 2 >nul & start http://localhost:8080"
%NODE% server.js
pause
