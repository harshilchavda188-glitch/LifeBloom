@echo off
title LifeBloom - Application Launcher
color 0A

:: Get the directory where this batch file is located
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:MENU
cls
echo ============================================
echo    LifeBloom - Life Management Application
echo ============================================
echo.
echo    [1] Install All Dependencies
echo    [2] Start Project (Frontend + Backend + Database)
echo    [3] Exit
echo.
echo ============================================
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto START_PROJECT
if "%choice%"=="3" goto EXIT
echo Invalid choice, try again...
timeout /t 2 /nobreak >nul
goto MENU

:INSTALL
cls
echo ============================================
echo    Installing All Dependencies
echo ============================================
echo.

:: Check Node.js
echo [1] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please download from: https://nodejs.org
    pause
    goto MENU
)
node -v

:: Check npm
echo [2] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    goto MENU
)
npm -v

:: Clean cache and old files
echo [3] Cleaning old files...
rmdir /s /q node_modules 2>nul
del /f /q package-lock.json 2>nul
npm cache clean --force 2>nul
echo OK

:: Install packages
echo [4] Installing npm packages...
echo This will take a few minutes. Please wait...
echo.
npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo Retrying with legacy peer deps...
    npm install --legacy-peer-deps
)
if %ERRORLEVEL% equ 0 (
    echo OK - All packages installed.
) else (
    echo WARNING - Some packages may have failed.
)

echo.
echo Dependencies install complete!
pause
goto MENU

:START_PROJECT
cls
echo ============================================
echo    Starting LifeBloom Project
echo ============================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    goto MENU
)

:: Check if dependencies exist
if not exist "node_modules" (
    echo [WARNING] Dependencies not found!
    echo Please run Option [1] first to install them.
    pause
    goto MENU
)

:: Ensure data directory exists for database
if not exist "data" (
    mkdir data
    echo [OK] Database directory created.
)

:: Kill any existing process on port 5000
echo [1/3] Checking port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do (
    if not "%%a"=="" (
        echo [INFO] Port 5000 in use by PID %%a - killing...
        taskkill /F /PID %%a >nul 2>nul
        timeout /t 2 /nobreak >nul
    )
)
echo [OK] Port 5000 is free.

:: Start backend
echo [2/3] Starting backend server on port 5000...
start "LifeBloom Backend" /B cmd /c "node server_js/index.js"
echo [OK] Backend server starting...

:: Wait for backend to be ready
timeout /t 3 /nobreak >nul

:: Start Expo frontend
echo [3/3] Starting Expo frontend (web)...
echo.
echo ============================================
echo    Backend API  : http://localhost:5000
echo    Expo Web App : http://localhost:8081
echo ============================================
echo.
start http://localhost:5000
timeout /t 2 /nobreak >nul
start http://localhost:8081

echo Starting Expo dev server...
echo Close this window to stop all services.
echo.
npx expo start --web

:: Cleanup when Expo exits
echo.
echo Shutting down services...
taskkill /F /FI "WINDOWTITLE eq LifeBloom Backend" >nul 2>nul
echo All services stopped.
pause
goto MENU

:EXIT
cls
echo Goodbye!
timeout /t 2 /nobreak >nul
exit /b 0
