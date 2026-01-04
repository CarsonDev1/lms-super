@echo off
REM LMS Backend - Docker Stop Script

echo ========================================
echo   Stopping LMS Backend Containers
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    pause
    exit /b 1
)

echo [INFO] Stopping development containers...
docker-compose down

echo.
echo [INFO] Stopping production containers...
docker-compose -f docker-compose.prod.yml down

echo.
echo ========================================
echo   All Containers Stopped
echo ========================================
echo.
pause
