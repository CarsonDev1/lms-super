# ✅ Checklist - LMS Backend Setup

## 🎯 Bắt đầu nhanh (5 phút)

### Bước 1: Chuẩn bị

-   [ ] Đã cài Docker Desktop
-   [ ] Docker Desktop đang chạy (icon ở system tray)
-   [ ] Đã có VS Code hoặc editor khác

### Bước 2: Khởi động (1 lệnh)

-   [ ] Double-click `docker-dev.bat`

    HOẶC mở terminal và chạy:

    ```bash
    docker-dev.bat
    ```

    HOẶC PowerShell:

    ```powershell
    .\docker.ps1 dev
    ```

### Bước 3: Kiểm tra (30 giây)

-   [ ] Đợi 30 giây cho services khởi động
-   [ ] Mở http://localhost:5000/health
    -   Thấy: `{"success": true, "message": "Server is healthy"}`
-   [ ] Mở http://localhost:5000/api-docs
    -   Thấy: Swagger UI interface

### Bước 4: Test API (2 phút)

-   [ ] Vào Swagger: http://localhost:5000/api-docs
-   [ ] Click `POST /api/auth/register`
-   [ ] Click "Try it out"
-   [ ] Điền thông tin:
    ```json
    {
    	"name": "Test User",
    	"email": "test@example.com",
    	"password": "password123"
    }
    ```
-   [ ] Click "Execute"
-   [ ] Thấy response status 201 và có accessToken

### Bước 5: Xem Database (1 phút)

-   [ ] Mở http://localhost:8081
-   [ ] Login: admin / admin123
-   [ ] Click vào `lms-database`
-   [ ] Thấy collections: `users`, `courses`
-   [ ] Click vào `users` → View Documents
-   [ ] Thấy user vừa tạo

## ✅ Xác nhận Setup Thành Công

Nếu tất cả các bước trên OK, bạn đã có:

-   ✅ Backend API đang chạy (port 5000)
-   ✅ MongoDB đang chạy (port 27017)
-   ✅ Mongo Express đang chạy (port 8081)
-   ✅ Swagger Docs đang hoạt động
-   ✅ JWT Authentication working
-   ✅ Database connected và có data

## 🎯 Workflow Phát Triển

### Mỗi khi bắt đầu làm việc:

-   [ ] Mở Docker Desktop
-   [ ] Chạy `docker-dev.bat`
-   [ ] Mở VS Code
-   [ ] Mở http://localhost:5000/api-docs

### Khi code:

-   [ ] Edit files trong `src/`
-   [ ] Backend tự động reload
-   [ ] Test trên Swagger UI
-   [ ] Xem logs: `docker-compose logs -f`

### Khi kết thúc:

-   [ ] Commit code: `git add . && git commit -m "message"`
-   [ ] Push: `git push`
-   [ ] Dừng Docker: `docker-compose down`

## 📚 Files Quan Trọng

### Bắt đầu đây:

-   [ ] Đọc [START_HERE.md](START_HERE.md) - Quickstart
-   [ ] Đọc [HUONG_DAN_DOCKER.md](HUONG_DAN_DOCKER.md) - Hướng dẫn VI
-   [ ] Đọc [HOAN_THANH.md](HOAN_THANH.md) - Tổng kết

### Tham khảo khi cần:

-   [ ] [README.md](README.md) - Documentation đầy đủ
-   [ ] [DOCKER.md](DOCKER.md) - Docker guide
-   [ ] [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture
-   [ ] [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - API reference

### Code structure:

```
src/
├── config/          📝 Cấu hình
├── controllers/     🎮 Business logic
├── middlewares/     🛡️ Auth, validation
├── models/          📊 Database schemas
├── routes/          🛣️ API routes
├── validators/      ✅ Input validation
└── utils/           🔧 Helpers
```

## 🚀 Các Commands Quan Trọng

### Docker

```bash
docker-dev.bat              # Start development
docker-compose logs -f      # View logs
docker-compose down         # Stop
docker-compose restart      # Restart
.\docker.ps1 backup         # Backup DB
```

### PowerShell Full Commands

```powershell
.\docker.ps1 dev      # Start
.\docker.ps1 stop     # Stop
.\docker.ps1 logs     # Logs
.\docker.ps1 shell    # Backend shell
.\docker.ps1 mongo    # MongoDB shell
.\docker.ps1 backup   # Backup
.\docker.ps1 help     # Help
```

### MongoDB

```bash
# Access MongoDB shell
docker exec -it lms-mongodb mongosh -u admin -p admin123

# Inside mongosh:
show dbs
use lms-database
show collections
db.users.find()
```

## 🔍 URLs Quan Trọng

```
✅ Backend API:      http://localhost:5000
✅ Swagger Docs:     http://localhost:5000/api-docs
✅ Health Check:     http://localhost:5000/health
✅ Mongo Express:    http://localhost:8081
```

## 🐛 Troubleshooting Quick Fix

### Docker không start?

```bash
# Check Docker Desktop running
# Restart Docker Desktop
# Run lại docker-dev.bat
```

### Port bị chiếm?

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Reset tất cả?

```bash
docker-compose down -v
docker-dev.bat
```

### Xem logs lỗi?

```bash
docker-compose logs backend-dev
docker-compose logs mongodb
```

## 📝 Next Features (Tùy chọn)

Sau khi setup xong, bạn có thể thêm:

-   [ ] Email service (Nodemailer/SendGrid)
-   [ ] File upload (Multer + AWS S3)
-   [ ] Redis caching
-   [ ] WebSocket (Socket.io)
-   [ ] Testing (Jest/Mocha)
-   [ ] CI/CD (GitHub Actions)
-   [ ] API versioning
-   [ ] More models (Enrollment, Review, etc.)

## ✨ Tips

1. **Luôn check Docker Desktop** trước khi chạy
2. **Dùng Swagger UI** - Tiện nhất để test API
3. **Dùng Mongo Express** - Xem data trực quan
4. **Backup thường xuyên** - `.\docker.ps1 backup`
5. **Xem logs khi debug** - `docker-compose logs -f`
6. **Đọc error messages** - Rất chi tiết và hữu ích

## 🎉 Congratulations!

Nếu tất cả checklist trên ✅:

**BẠN ĐÃ CÓ MỘT BACKEND PROFESSIONAL, PRODUCTION-READY!** 🚀

-   ✅ Express.js + ES6
-   ✅ MongoDB + Mongoose
-   ✅ JWT Authentication
-   ✅ Swagger Documentation
-   ✅ Docker Setup
-   ✅ Security Features
-   ✅ Logging System
-   ✅ Error Handling

**Giờ bắt đầu code thôi!** 💻✨

---

**Có vấn đề?** Xem [HUONG_DAN_DOCKER.md](HUONG_DAN_DOCKER.md) hoặc [README.md](README.md)
