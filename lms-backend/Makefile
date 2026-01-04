# Makefile for LMS Backend Docker Operations
# Usage: make <command>

.PHONY: help build up down restart logs clean dev prod test backup

# Default target
help:
	@echo "🐳 LMS Backend Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make logs         - View development logs"
	@echo "  make shell        - Access backend container shell"
	@echo "  make mongo        - Access MongoDB shell"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-logs    - View production logs"
	@echo ""
	@echo "Management:"
	@echo "  make stop         - Stop all containers"
	@echo "  make restart      - Restart all containers"
	@echo "  make clean        - Remove containers and volumes"
	@echo "  make rebuild      - Rebuild and restart"
	@echo ""
	@echo "Database:"
	@echo "  make backup       - Backup MongoDB database"
	@echo "  make restore      - Restore MongoDB database"
	@echo ""
	@echo "Utilities:"
	@echo "  make ps           - List running containers"
	@echo "  make stats        - Show container statistics"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose up -d
	@echo "✅ Development environment is running"
	@echo "📚 API: http://localhost:5000"
	@echo "📖 Swagger: http://localhost:5000/api-docs"
	@echo "🔍 Mongo Express: http://localhost:8081"

logs:
	docker-compose logs -f

shell:
	docker exec -it lms-backend-dev sh

mongo:
	docker exec -it lms-mongodb mongosh -u admin -p admin123

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✅ Production environment is running"

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Management commands
stop:
	@echo "🛑 Stopping containers..."
	docker-compose down

restart:
	@echo "🔄 Restarting containers..."
	docker-compose restart

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete"

rebuild:
	@echo "🔨 Rebuilding containers..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Rebuild complete"

# Database commands
backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	docker exec lms-mongodb mongodump --authenticationDatabase admin -u admin -p admin123 --out /data/backup
	docker cp lms-mongodb:/data/backup ./backups/backup-$$(date +%Y%m%d-%H%M%S)
	@echo "✅ Backup created in ./backups/"

restore:
	@echo "📥 Restoring database..."
	@read -p "Enter backup directory name: " backup; \
	docker cp ./backups/$$backup lms-mongodb:/data/restore && \
	docker exec lms-mongodb mongorestore --authenticationDatabase admin -u admin -p admin123 /data/restore
	@echo "✅ Database restored"

# Utility commands
ps:
	docker-compose ps

stats:
	docker stats lms-backend-dev lms-mongodb

# Install dependencies
install:
	npm install

# Run tests (when implemented)
test:
	docker-compose exec backend-dev npm test
