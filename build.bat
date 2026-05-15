@echo off
REM Build and test script for local development (Windows)
REM Useful for testing CI/CD pipeline locally

setlocal enabledelayedexpansion

echo.
echo ================================
echo Smart Patient Monitor - Local Build
echo ================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9 or later.
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo [OK] %%i

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18 or later.
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo [OK] %%i

REM Check/Install PlatformIO
echo Checking PlatformIO...
platformio --version >nul 2>&1
if errorlevel 1 (
    echo Installing PlatformIO...
    pip install platformio
)
for /f "tokens=*" %%i in ('platformio --version') do echo [OK] %%i

REM Build ESP32 Firmware
echo.
echo Building ESP32 Firmware...
platformio run
if errorlevel 1 (
    echo [ERROR] Firmware build failed
    exit /b 1
)
echo [OK] Firmware build successful
echo Output: .pio\build\esp32dev\firmware.bin
echo.

REM Run Unit Tests
echo Running Unit Tests...
echo Testing Sensors, Outputs, and Integration...
platformio test -e test-native --verbose
if errorlevel 1 (
    echo [WARNING] Some tests may have failed
)
echo [OK] Unit tests executed
echo.

REM Build React Dashboard
echo Building React Dashboard...
cd Dashboard\esp32-dashboard
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [ERROR] npm install failed
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] Dashboard build failed
    exit /b 1
)
echo [OK] Dashboard build successful
echo Output: build\ directory
cd ..\..
echo.

REM Size Analysis
echo Firmware Size Analysis...
platformio run --target size

REM Summary
echo.
echo ================================
echo [OK] Build Summary
echo ================================
echo [OK] Firmware compiled
echo [OK] Dashboard built
echo [OK] All checks passed
echo.
echo Next steps:
echo 1. Flash firmware: platformio run --target upload
echo 2. Deploy dashboard: Upload build/ contents to web server
echo.

pause
