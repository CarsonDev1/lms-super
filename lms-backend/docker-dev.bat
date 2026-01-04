@echo off
REM LMS Backend - Docker Development Startup Script
REM This script starts the development environment with Docker

echo ========================================
echo   LMS Backend - Development Setup
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [INFO] Docker is running...
echo.

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose down >nul 2>&1

REM Start Docker Compose
echo [INFO] Starting development environment...
echo.
docker-compose up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Development Environment Ready!
echo ========================================
echo.
echo Services:
echo   - Backend API:      http://localhost:5000
echo   - Swagger Docs:     http://localhost:5000/api-docs
echo   - Health Check:     http://localhost:5000/health
echo   - Mongo Express:    http://localhost:8081
echo     Username: admin
echo     Password: admin123
echo.
echo MongoDB Connection:
echo   Host: localhost:27017
echo   Username: admin
echo   Password: admin123
echo   Database: lms-database
echo.
echo ========================================
echo.
echo Commands:
echo   - View logs:        docker-compose logs -f
echo   - Stop:             docker-compose down
echo   - Restart:          docker-compose restart
echo.

REM Wait a moment for services to start
timeout /t 5 /nobreak >nul

REM Check if backend is healthy
echo [INFO] Checking backend health...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo [WARN] Backend might still be starting...
    echo Please wait a moment and check http://localhost:5000/health
) else (
    echo [SUCCESS] Backend is healthy!
)

echo.
echo Press any key to view logs (Ctrl+C to exit)...
pause >nul

docker-compose logs -f
