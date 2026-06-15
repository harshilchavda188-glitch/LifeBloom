# LifeBloom Project Launcher (PowerShell)
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   LifeBloom - Life Management Application" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [1] Install All Dependencies" -ForegroundColor Yellow
Write-Host "   [2] Start Project (Frontend + Backend + Database)" -ForegroundColor Yellow
Write-Host "   [3] Exit" -ForegroundColor Yellow
Write-Host ""
$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`nInstalling Dependencies..." -ForegroundColor Green
        $nodeVersion = node -v 2>$null
        if (-not $nodeVersion) {
            Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
            pause
            exit
        }
        Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] All packages installed." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Some packages may have failed." -ForegroundColor Yellow
        }
        pause
    }
    "2" {
        Write-Host "`nStarting LifeBloom Project..." -ForegroundColor Green
        
        if (-not (Test-Path "node_modules")) {
            Write-Host "[ERROR] Dependencies not found. Run Option 1 first." -ForegroundColor Red
            pause
            exit
        }
        
        # Create data directory
        if (-not (Test-Path "data")) { New-Item -ItemType Directory -Path "data" | Out-Null }
        
        # Kill port 5000
        $process = netstat -ano | Select-String ":5000 "
        if ($process) {
            $pid = $process.Line.Trim().Split(" ")[-1]
            if ($pid -and $pid -ne "0") {
                Write-Host "[INFO] Killing process on port 5000 (PID: $pid)..." -ForegroundColor Yellow
                taskkill /F /PID $pid 2>$null
                Start-Sleep -Seconds 2
            }
        }
        
        Write-Host "[OK] Starting backend server..." -ForegroundColor Green
        Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server_js/index.js"
        Start-Sleep -Seconds 3
        
        Write-Host "[OK] Starting Expo frontend..." -ForegroundColor Green
        Write-Host "`n============================================" -ForegroundColor Cyan
        Write-Host "   Backend API  : http://localhost:5000" -ForegroundColor Cyan
        Write-Host "   Expo Web App : http://localhost:8081" -ForegroundColor Cyan
        Write-Host "============================================`n" -ForegroundColor Cyan
        
        Start-Process "http://localhost:5000"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:8081"
        
        npx expo start --web
    }
    "3" {
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        pause
    }
}
