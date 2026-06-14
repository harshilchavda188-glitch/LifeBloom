@echo off
title LifeBloom - Starting Application
color 0A

echo ============================================
echo    LifeBloom - Life Management Application
echo    Starting all services...
echo ============================================
echo.

:: Get the directory where this batch file is located
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node -v

:: Check npm
echo [2/5] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
echo [OK] npm found: 
npm -v

:: Install dependencies if node_modules missing
echo [3/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing npm dependencies (first run - this may take a while)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
) else (
    echo [OK] Dependencies already installed.
)

:: Check PHP
echo [4/5] Checking PHP...
where php >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] PHP found:
    php -v | findstr /i "PHP"
    
    :: Check MySQL and setup database
    echo Setting up MySQL database...
    where mysql >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Creating LifeBloom database...
        mysql -u root < "php\schema.sql" 2>nul
        if %ERRORLEVEL% equ 0 (
            echo [OK] Database setup complete.
        ) else (
            echo [!] Could not auto-setup database. Please run php\schema.sql manually.
        )
    ) else (
        echo [!] MySQL client not found in PATH. Import php\schema.sql manually.
    )
    
    :: Start PHP built-in server for API
    echo Starting PHP API server on port 8000...
    start "LifeBloom PHP API" /B php -S localhost:8000 -t php php/index.php
    echo [OK] PHP API server running at http://localhost:8000
) else (
    echo [!] PHP not found. PHP API will not be available.
    echo    Install PHP from https://windows.php.net/download/
)

:: Start Express backend server
echo [5/5] Starting services...
echo.
echo Starting Express backend server on port 5000...
start "LifeBloom Express" /B cmd /c "npx tsx server/index.ts"

echo Starting Expo dev server (web)...
echo.
echo ============================================
echo    Express Backend : http://localhost:5000
echo    PHP API         : http://localhost:8000
echo    Expo Web App    : http://localhost:8081
echo ============================================
echo.
echo Opening Expo web interface...
start http://localhost:8081

call npx expo start --web

echo.
echo All services started! Close this window to stop all services.
pause
