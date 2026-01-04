@echo off
REM LMS Backend - Docker Production Startup Script

echo ========================================
echo   LMS Backend - Production Setup
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

REM Check if .env.production exists
if not exist .env.production (
    echo [WARN] .env.production file not found!
    echo Creating from .env.docker template...
    copy .env.docker .env.production >nul
    echo.
    echo [ACTION REQUIRED] Please edit .env.production with your production values:
    echo   - MONGO_ROOT_PASSWORD
    echo   - JWT_ACCESS_SECRET
    echo   - JWT_REFRESH_SECRET
    echo   - CORS_ORIGIN
    echo.
    notepad .env.production
    echo.
    echo Press any key after saving the file...
    pause >nul
)

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose -f docker-compose.prod.yml down >nul 2>&1

REM Build and start production environment
echo [INFO] Building and starting production environment...
echo This may take a few minutes...
echo.
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Production Environment Ready!
echo ========================================
echo.
echo Services:
echo   - Backend API:      http://localhost:5000
echo   - Swagger Docs:     http://localhost:5000/api-docs
echo   - Health Check:     http://localhost:5000/health
echo.
echo ========================================
echo.
echo Commands:
echo   - View logs:        docker-compose -f docker-compose.prod.yml logs -f
echo   - Stop:             docker-compose -f docker-compose.prod.yml down
echo   - Restart:          docker-compose -f docker-compose.prod.yml restart
echo.

REM Wait for services to start
echo [INFO] Waiting for services to start...
timeout /t 10 /nobreak >nul

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

docker-compose -f docker-compose.prod.yml logs -f
