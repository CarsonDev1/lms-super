# 🐳 Docker Quick Start

## Cách nhanh nhất để chạy LMS Backend

### 🚀 Khởi động Development (1 lệnh)

**Windows Command Prompt:**

```bash
docker-dev.bat
```

**PowerShell:**

```powershell
.\docker.ps1 dev
```

**Cross-platform:**

```bash
docker-compose up -d
```

### 📍 Truy cập các dịch vụ

Sau khi chạy, truy cập:

-   **Backend API**: http://localhost:5000
-   **Swagger Documentation**: http://localhost:5000/api-docs
-   **Health Check**: http://localhost:5000/health
-   **Mongo Express** (Database UI): http://localhost:8081
    -   Username: `admin`
    -   Password: `admin123`

### 🎯 Các lệnh thường dùng

```bash
# Xem logs
docker-compose logs -f

# Dừng containers
docker-compose down

# Khởi động lại
docker-compose restart

# Xóa containers và volumes
docker-compose down -v

# Truy cập MongoDB shell
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Truy cập backend container shell
docker exec -it lms-backend-dev sh
```

### 🔧 PowerShell Script Commands

```powershell
.\docker.ps1 dev      # Start development
.\docker.ps1 prod     # Start production
.\docker.ps1 stop     # Stop all
.\docker.ps1 logs     # View logs
.\docker.ps1 shell    # Access backend shell
.\docker.ps1 mongo    # Access MongoDB shell
.\docker.ps1 backup   # Backup database
.\docker.ps1 help     # Show help
```

### 📊 Kiểm tra container đang chạy

```bash
docker ps
```

Bạn sẽ thấy 3 containers:

-   `lms-backend-dev` - Backend Node.js
-   `lms-mongodb` - MongoDB Database
-   `lms-mongo-express` - Database GUI

### 🛑 Dừng tất cả

```bash
# Windows
docker-stop.bat

# PowerShell
.\docker.ps1 stop

# Direct
docker-compose down
```

### 💾 Backup Database

```powershell
.\docker.ps1 backup
```

Backup sẽ được lưu trong thư mục `backups/`

### ⚡ Quick Test

Test API ngay sau khi start:

```bash
curl http://localhost:5000/health
```

### 📚 Tài liệu đầy đủ

Xem [DOCKER.md](DOCKER.md) để biết thêm chi tiết về:

-   Production deployment
-   Docker configuration
-   Troubleshooting
-   Best practices

---

**Lưu ý**: Đảm bảo Docker Desktop đang chạy trước khi thực hiện các lệnh trên!
