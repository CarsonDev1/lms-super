# LMS Backend - Docker PowerShell Script
# Usage: .\docker.ps1 [command]

param(
    [Parameter(Position=0)]
    [ValidateSet('dev', 'prod', 'stop', 'logs', 'clean', 'restart', 'shell', 'mongo', 'backup', 'help')]
    [string]$Command = 'help'
)

function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Test-Docker {
    try {
        docker info *>$null
        return $true
    } catch {
        Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        return $false
    }
}

function Start-Development {
    Write-Header "Starting Development Environment"
    
    if (-not (Test-Docker)) { return }
    
    Write-Host "[INFO] Stopping existing containers..." -ForegroundColor Yellow
    docker-compose down *>$null
    
    Write-Host "[INFO] Starting development environment...`n" -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Header "Development Environment Ready!"
        Write-Host "Services:" -ForegroundColor Green
        Write-Host "  - Backend API:      http://localhost:5000" -ForegroundColor White
        Write-Host "  - Swagger Docs:     http://localhost:5000/api-docs" -ForegroundColor White
        Write-Host "  - Health Check:     http://localhost:5000/health" -ForegroundColor White
        Write-Host "  - Mongo Express:    http://localhost:8081" -ForegroundColor White
        Write-Host "    Username: admin / Password: admin123`n" -ForegroundColor Gray
        
        Write-Host "Commands:" -ForegroundColor Green
        Write-Host "  - View logs:        .\docker.ps1 logs" -ForegroundColor White
        Write-Host "  - Stop:             .\docker.ps1 stop" -ForegroundColor White
        Write-Host "  - Access shell:     .\docker.ps1 shell`n" -ForegroundColor White
    } else {
        Write-Host "`n[ERROR] Failed to start containers!" -ForegroundColor Red
    }
}

function Start-Production {
    Write-Header "Starting Production Environment"
    
    if (-not (Test-Docker)) { return }
    
    if (-not (Test-Path .env.production)) {
        Write-Host "[WARN] .env.production not found!" -ForegroundColor Yellow
        Write-Host "Creating from template...`n" -ForegroundColor Yellow
        Copy-Item .env.docker .env.production
        Write-Host "[ACTION REQUIRED] Please edit .env.production with your values`n" -ForegroundColor Red
        notepad .env.production
        Read-Host "Press Enter after saving the file"
    }
    
    Write-Host "[INFO] Building production environment...`n" -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Header "Production Environment Ready!"
        Write-Host "Backend API: http://localhost:5000" -ForegroundColor Green
    }
}

function Stop-Containers {
    Write-Header "Stopping Containers"
    
    if (-not (Test-Docker)) { return }
    
    Write-Host "[INFO] Stopping development containers..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host "[INFO] Stopping production containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml down
    
    Write-Host "`n[SUCCESS] All containers stopped`n" -ForegroundColor Green
}

function Show-Logs {
    Write-Header "Container Logs"
    docker-compose logs -f
}

function Clean-All {
    Write-Header "Cleaning Up"
    
    if (-not (Test-Docker)) { return }
    
    $confirm = Read-Host "This will remove all containers and volumes. Continue? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        docker-compose down -v
        Write-Host "`n[SUCCESS] Cleanup complete`n" -ForegroundColor Green
    } else {
        Write-Host "`n[INFO] Cleanup cancelled`n" -ForegroundColor Yellow
    }
}

function Restart-Containers {
    Write-Header "Restarting Containers"
    docker-compose restart
    Write-Host "`n[SUCCESS] Containers restarted`n" -ForegroundColor Green
}

function Open-Shell {
    Write-Header "Backend Container Shell"
    docker exec -it lms-backend-dev sh
}

function Open-Mongo {
    Write-Header "MongoDB Shell"
    docker exec -it lms-mongodb mongosh -u admin -p admin123
}

function Backup-Database {
    Write-Header "Database Backup"
    
    $backupDir = "backups"
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "$backupDir/backup-$timestamp"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    Write-Host "[INFO] Creating backup..." -ForegroundColor Yellow
    docker exec lms-mongodb mongodump --authenticationDatabase admin -u admin -p admin123 --out /data/backup
    docker cp "lms-mongodb:/data/backup" $backupPath
    
    Write-Host "`n[SUCCESS] Backup created: $backupPath`n" -ForegroundColor Green
}

function Show-Help {
    Write-Header "LMS Backend Docker Commands"
    
    Write-Host "Usage: .\docker.ps1 [command]`n" -ForegroundColor White
    
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  dev          Start development environment" -ForegroundColor White
    Write-Host "  prod         Start production environment" -ForegroundColor White
    Write-Host "  stop         Stop all containers" -ForegroundColor White
    Write-Host "  logs         View container logs" -ForegroundColor White
    Write-Host "  clean        Remove containers and volumes" -ForegroundColor White
    Write-Host "  restart      Restart containers" -ForegroundColor White
    Write-Host "  shell        Access backend container shell" -ForegroundColor White
    Write-Host "  mongo        Access MongoDB shell" -ForegroundColor White
    Write-Host "  backup       Backup MongoDB database" -ForegroundColor White
    Write-Host "  help         Show this help message`n" -ForegroundColor White
}

# Execute command
switch ($Command) {
    'dev'     { Start-Development }
    'prod'    { Start-Production }
    'stop'    { Stop-Containers }
    'logs'    { Show-Logs }
    'clean'   { Clean-All }
    'restart' { Restart-Containers }
    'shell'   { Open-Shell }
    'mongo'   { Open-Mongo }
    'backup'  { Backup-Database }
    'help'    { Show-Help }
    default   { Show-Help }
}
