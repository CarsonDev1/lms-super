# ✅ Docker Configuration Complete!

## 🐳 Docker Files Created

### Core Docker Files

-   ✅ `Dockerfile` - Multi-stage build (dev + prod)
-   ✅ `docker-compose.yml` - Development environment
-   ✅ `docker-compose.prod.yml` - Production environment
-   ✅ `.dockerignore` - Docker ignore rules
-   ✅ `.env.docker` - Docker environment template
-   ✅ `mongo-init.js` - MongoDB initialization script

### Windows Scripts

-   ✅ `docker-dev.bat` - Start development (CMD)
-   ✅ `docker-prod.bat` - Start production (CMD)
-   ✅ `docker-stop.bat` - Stop all containers (CMD)
-   ✅ `docker.ps1` - PowerShell management script

### Unix/Linux Scripts

-   ✅ `Makefile` - Make commands for Unix systems

### Documentation

-   ✅ `DOCKER.md` - Complete Docker documentation
-   ✅ `DOCKER_QUICK_START.md` - Quick start guide

## 🚀 How to Use

### Quick Start (Windows)

**Method 1: Batch File (Easiest)**

```cmd
docker-dev.bat
```

**Method 2: PowerShell**

```powershell
.\docker.ps1 dev
```

**Method 3: Docker Compose**

```bash
docker-compose up -d
```

### Services Included

1. **Backend** (Node.js + Express)

    - Port: 5000
    - Hot-reload enabled (dev mode)
    - Health checks
    - Auto-restart

2. **MongoDB**

    - Port: 27017
    - Username: admin
    - Password: admin123
    - Persistent volumes
    - Auto-initialization

3. **Mongo Express** (Database GUI)
    - Port: 8081
    - Username: admin
    - Password: admin123

## 📍 Access URLs

After running `docker-dev.bat`:

-   **Backend API**: http://localhost:5000
-   **Swagger Docs**: http://localhost:5000/api-docs
-   **Health Check**: http://localhost:5000/health
-   **Mongo Express**: http://localhost:8081

## 🎯 Common Commands

### PowerShell Commands

```powershell
.\docker.ps1 dev      # Start development
.\docker.ps1 prod     # Start production
.\docker.ps1 stop     # Stop all containers
.\docker.ps1 logs     # View logs
.\docker.ps1 shell    # Access backend shell
.\docker.ps1 mongo    # Access MongoDB shell
.\docker.ps1 backup   # Backup database
.\docker.ps1 clean    # Remove all containers & volumes
.\docker.ps1 help     # Show help
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker ps

# Access MongoDB shell
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Access backend shell
docker exec -it lms-backend-dev sh
```

## ⚙️ Configuration

### Development Environment

Environment variables are defined in `docker-compose.yml`:

-   MongoDB: admin/admin123
-   JWT secrets: dev-xxx-secret
-   CORS: localhost:3000
-   Log level: debug

### Production Environment

Copy and edit `.env.docker`:

```bash
cp .env.docker .env.production
# Edit .env.production with your values
```

Then run:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 🔧 Features

### Multi-stage Dockerfile

-   **Development**: Full environment with nodemon
-   **Production**: Optimized, minimal image
-   Non-root user for security
-   Health checks included

### Docker Compose Benefits

-   One command setup
-   MongoDB included
-   Network isolation
-   Persistent data
-   Auto-restart on crash
-   Health monitoring

### Volume Management

-   `mongodb_data`: Database files
-   `mongodb_config`: MongoDB config
-   `./logs`: Application logs
-   `./src`: Source code (dev only)

## 📊 MongoDB Management

### Via Mongo Express (GUI)

1. Open http://localhost:8081
2. Login: admin / admin123
3. Browse collections visually

### Via MongoDB Shell

```bash
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Inside MongoDB shell
> show dbs
> use lms-database
> show collections
> db.users.find()
```

## 💾 Database Backup

### Automatic Backup

```powershell
.\docker.ps1 backup
```

Backups are saved in `backups/` directory.

### Manual Backup

```bash
docker exec lms-mongodb mongodump \
  --authenticationDatabase admin \
  -u admin -p admin123 \
  --out /data/backup
```

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Docker Not Running

```bash
# Start Docker Desktop
# Wait for it to fully start
# Then run docker-dev.bat again
```

### Container Won't Start

```bash
# View logs
docker-compose logs backend-dev

# Restart with fresh build
docker-compose down
docker-compose up -d --build
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongodb

# View MongoDB logs
docker logs lms-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

## 🚀 Production Deployment

### Using Docker Compose

```bash
# On your server
git clone <repository>
cd lms-backend

# Configure production environment
cp .env.docker .env.production
nano .env.production

# Start production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Using Docker Swarm

```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml lms
```

### Best Practices

-   ✅ Use strong passwords in production
-   ✅ Enable SSL/TLS
-   ✅ Set up monitoring
-   ✅ Configure backups
-   ✅ Use secrets management
-   ✅ Limit container resources
-   ✅ Set up log rotation

## 📚 Documentation

-   **Complete Guide**: [DOCKER.md](DOCKER.md)
-   **Quick Start**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
-   **Main README**: [README.md](README.md)

## ✨ What's Next?

1. **Start the application**

    ```bash
    docker-dev.bat
    ```

2. **Access Swagger docs**

    - http://localhost:5000/api-docs

3. **Test the API**

    - Register a user
    - Login
    - Create courses
    - View Mongo Express

4. **Develop your features**
    - Edit code in `src/`
    - Changes auto-reload
    - View logs in real-time

## 🎉 Benefits of Docker Setup

✅ **One-command setup** - No manual MongoDB installation  
✅ **Consistent environment** - Works same everywhere  
✅ **Isolated services** - No conflicts with host  
✅ **Easy cleanup** - `docker-compose down -v`  
✅ **Production-ready** - Same config for prod  
✅ **Database included** - MongoDB + GUI  
✅ **Auto-restart** - Services recover from crashes  
✅ **Health checks** - Monitor service health  
✅ **Volume persistence** - Data survives restarts  
✅ **Network isolation** - Secure by default

---

**Docker Configuration**: ✅ COMPLETE  
**Ready for Development**: 🚀 YES  
**Production Ready**: ✅ YES

Chạy `docker-dev.bat` để bắt đầu! 🎉
