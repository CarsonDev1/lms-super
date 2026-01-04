# 🐳 Docker Setup Guide

## 📦 Docker Files Overview

```
lms-backend/
├── Dockerfile                    # Multi-stage Dockerfile
├── docker-compose.yml            # Development setup
├── docker-compose.prod.yml       # Production setup
├── .dockerignore                 # Files to ignore in Docker
├── .env.docker                   # Docker environment variables
└── mongo-init.js                 # MongoDB initialization script
```

## 🚀 Quick Start

### Development Mode (Recommended)

```bash
# Start all services (backend + MongoDB + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Mode

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 📋 Available Services

### Development (docker-compose.yml)

1. **MongoDB** - Port 27017

    - Database server
    - With authentication
    - Persistent data volume

2. **Backend (Dev)** - Port 5000

    - Hot-reload enabled
    - Source code mounted
    - Debug logging

3. **Mongo Express** - Port 8081
    - Web GUI for MongoDB
    - Username: admin
    - Password: admin123

### Production (docker-compose.prod.yml)

1. **MongoDB** - Port 27017

    - Production-grade setup
    - Initialization script
    - Persistent volumes

2. **Backend (Prod)** - Port 5000

    - Optimized build
    - No dev dependencies
    - Production logging

3. **Nginx** - Ports 80/443 (optional)
    - Reverse proxy
    - SSL/TLS support
    - Load balancing

## 🔗 Access URLs

### Development

-   **Backend API**: http://localhost:5000
-   **Swagger Docs**: http://localhost:5000/api-docs
-   **Health Check**: http://localhost:5000/health
-   **Mongo Express**: http://localhost:8081

### Production

-   **Backend API**: http://localhost:5000 (or configured domain)
-   **Swagger Docs**: http://localhost:5000/api-docs
-   **Nginx**: http://localhost:80 (if enabled)

## 📝 Environment Configuration

### Development

Environment variables are defined directly in `docker-compose.yml`.

### Production

Copy and configure the production environment file:

```bash
# Copy template
cp .env.docker .env.production

# Edit with your values
nano .env.production
```

Required variables:

```env
MONGO_ROOT_PASSWORD=your-strong-password
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
CORS_ORIGIN=https://your-domain.com
```

Then use it:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 🛠️ Docker Commands Cheat Sheet

### Build & Start

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d --build

# Rebuild without cache
docker-compose build --no-cache
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-dev
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 backend-dev
```

### Service Management

```bash
# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Restart services
docker-compose restart

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Backup database
docker exec lms-mongodb mongodump --authenticationDatabase admin -u admin -p admin123 --out /data/backup

# Restore database
docker exec lms-mongodb mongorestore --authenticationDatabase admin -u admin -p admin123 /data/backup
```

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container stats
docker stats

# Access container shell
docker exec -it lms-backend-dev sh
docker exec -it lms-mongodb bash
```

## 🔍 Debugging

### Check Container Health

```bash
# View health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Inspect container
docker inspect lms-backend-dev
```

### View Container Logs

```bash
# Real-time logs
docker logs -f lms-backend-dev

# Last 50 lines
docker logs --tail=50 lms-backend-dev
```

### Test MongoDB Connection

```bash
# From host
mongosh "mongodb://admin:admin123@localhost:27017/lms-database?authSource=admin"

# From backend container
docker exec -it lms-backend-dev node -e "require('mongoose').connect('mongodb://admin:admin123@mongodb:27017/lms-database?authSource=admin').then(() => console.log('Connected')).catch(err => console.error(err))"
```

## 📊 MongoDB Management

### Using Mongo Express (GUI)

1. Open http://localhost:8081
2. Login with: admin / admin123
3. Navigate through databases and collections

### Using MongoDB Shell

```bash
# Access shell
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Common commands
> show dbs
> use lms-database
> show collections
> db.users.find()
> db.courses.countDocuments()
```

## 🔒 Production Security Checklist

-   [ ] Change default MongoDB credentials
-   [ ] Use strong JWT secrets (min 32 characters)
-   [ ] Configure proper CORS origin
-   [ ] Enable SSL/TLS with Nginx
-   [ ] Set up firewall rules
-   [ ] Use Docker secrets for sensitive data
-   [ ] Limit container resources
-   [ ] Enable MongoDB authentication
-   [ ] Set up backup strategy
-   [ ] Configure log rotation
-   [ ] Use environment-specific .env files
-   [ ] Remove Mongo Express in production

## 🚀 Deployment Options

### Docker Compose (Simple)

```bash
# On server
git clone <repository>
cd lms-backend
cp .env.docker .env.production
# Edit .env.production with production values
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Docker Swarm (Scalable)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml lms
```

### Kubernetes (Enterprise)

```bash
# Convert docker-compose to k8s
kompose convert -f docker-compose.prod.yml

# Deploy to cluster
kubectl apply -f .
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "3000:5000"  # Host:Container
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs lms-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Permission Issues

```bash
# Fix volume permissions
docker-compose down
sudo chown -R $USER:$USER ./logs
docker-compose up -d
```

### Container Won't Start

```bash
# Check logs
docker logs lms-backend-dev

# Check for port conflicts
docker ps -a

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate
```

## 📈 Performance Optimization

### Limit Container Resources

```yaml
services:
    backend:
        deploy:
            resources:
                limits:
                    cpus: '1'
                    memory: 512M
                reservations:
                    cpus: '0.5'
                    memory: 256M
```

### Use BuildKit

```bash
# Enable BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build
```

### Multi-stage Build

The Dockerfile uses multi-stage builds to minimize image size:

-   Development image: ~200MB
-   Production image: ~150MB

## 🔄 Updates & Maintenance

### Update Docker Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean Up

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

## 📦 Backup & Restore

### Backup MongoDB

```bash
# Create backup
docker exec lms-mongodb mongodump \
  --authenticationDatabase admin \
  -u admin \
  -p admin123 \
  --out /data/backup

# Copy backup to host
docker cp lms-mongodb:/data/backup ./backups/$(date +%Y%m%d)
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backups/20250101 lms-mongodb:/data/restore

# Restore
docker exec lms-mongodb mongorestore \
  --authenticationDatabase admin \
  -u admin \
  -p admin123 \
  /data/restore
```

## 🎯 Best Practices

1. **Use .env files** for environment-specific configs
2. **Always use named volumes** for persistent data
3. **Implement health checks** for all services
4. **Use multi-stage builds** to optimize image size
5. **Run as non-root user** in production
6. **Set resource limits** to prevent resource exhaustion
7. **Use Docker secrets** for sensitive data
8. **Enable logging drivers** for centralized logging
9. **Regular backups** of MongoDB data
10. **Monitor container metrics** with monitoring tools

---

**Docker Configuration Version**: 1.0  
**Last Updated**: December 2025
