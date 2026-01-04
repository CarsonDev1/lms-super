# 🐳 Hướng Dẫn Docker - Tiếng Việt

## 🚀 Khởi động nhanh nhất

### Bước 1: Đảm bảo Docker Desktop đang chạy

-   Mở Docker Desktop
-   Đợi cho đến khi icon Docker ở system tray không còn chuyển động

### Bước 2: Chạy lệnh

Chỉ cần **double-click** vào file:

```
docker-dev.bat
```

Hoặc mở Command Prompt và gõ:

```cmd
docker-dev.bat
```

### Bước 3: Đợi khởi động (khoảng 30 giây)

Bạn sẽ thấy:

```
✅ Development environment is running
📚 API: http://localhost:5000
📖 Swagger: http://localhost:5000/api-docs
🔍 Mongo Express: http://localhost:8081
```

### Bước 4: Truy cập ứng dụng

-   **API Documentation**: http://localhost:5000/api-docs
-   **Health Check**: http://localhost:5000/health
-   **Database GUI**: http://localhost:8081
    -   Username: `admin`
    -   Password: `admin123`

## 📊 Các dịch vụ đang chạy

Sau khi chạy `docker-dev.bat`, bạn có:

1. **Backend API** (cổng 5000)

    - Node.js + Express
    - Tự động reload khi code thay đổi
    - Có sẵn JWT, Swagger, Logger

2. **MongoDB** (cổng 27017)

    - Database server
    - Username: admin
    - Password: admin123
    - Dữ liệu được lưu vĩnh viễn

3. **Mongo Express** (cổng 8081)
    - Giao diện web để xem database
    - Không cần cài MongoDB Compass

## 🎯 Các lệnh thường dùng

### Xem logs của backend

```cmd
docker-compose logs -f backend-dev
```

### Dừng tất cả

```cmd
docker-stop.bat
```

Hoặc:

```cmd
docker-compose down
```

### Khởi động lại

```cmd
docker-compose restart
```

### Xem container đang chạy

```cmd
docker ps
```

### Truy cập MongoDB shell

```cmd
docker exec -it lms-mongodb mongosh -u admin -p admin123
```

Sau đó bạn có thể:

```javascript
show dbs
use lms-database
show collections
db.users.find()
db.courses.find()
```

## 🔧 Sử dụng PowerShell (nâng cao)

Nếu bạn thích PowerShell, có thể dùng:

```powershell
# Khởi động development
.\docker.ps1 dev

# Xem logs
.\docker.ps1 logs

# Dừng tất cả
.\docker.ps1 stop

# Backup database
.\docker.ps1 backup

# Truy cập backend shell
.\docker.ps1 shell

# Truy cập MongoDB shell
.\docker.ps1 mongo

# Xem trợ giúp
.\docker.ps1 help
```

## 🧪 Test API

### 1. Mở Swagger UI

http://localhost:5000/api-docs

### 2. Đăng ký user mới

Click vào `POST /api/auth/register`, sau đó click "Try it out":

```json
{
	"name": "Nguyen Van A",
	"email": "nguyenvana@example.com",
	"password": "password123"
}
```

### 3. Đăng nhập

Click vào `POST /api/auth/login`:

```json
{
	"email": "nguyenvana@example.com",
	"password": "password123"
}
```

Copy `accessToken` từ response.

### 4. Sử dụng token

Click vào nút **Authorize** ở trên cùng, paste token vào:

```
Bearer <your-token-here>
```

### 5. Tạo course

Bây giờ bạn có thể test các API cần authentication!

## 📁 Thư mục làm việc

Khi dùng Docker:

```
lms-backend/
├── src/              👈 Code của bạn ở đây
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
├── logs/             👈 File log tự động tạo
└── backups/          👈 Backup database (nếu có)
```

**Quan trọng**: Khi bạn sửa code trong `src/`, Docker sẽ tự động reload!

## 🔍 Xem Database

### Cách 1: Dùng Mongo Express (Dễ nhất)

1. Mở http://localhost:8081
2. Login: admin / admin123
3. Click vào `lms-database`
4. Xem collections: `users`, `courses`

### Cách 2: Dùng MongoDB Shell

```cmd
docker exec -it lms-mongodb mongosh -u admin -p admin123
```

Sau đó:

```javascript
use lms-database
db.users.find().pretty()
db.courses.find().pretty()
```

## 💾 Backup Database

### Tự động

```powershell
.\docker.ps1 backup
```

File backup sẽ ở thư mục `backups/`

### Thủ công

```cmd
docker exec lms-mongodb mongodump --authenticationDatabase admin -u admin -p admin123 --out /data/backup
docker cp lms-mongodb:/data/backup ./backups/my-backup
```

## ❌ Dừng và dọn dẹp

### Chỉ dừng (giữ data)

```cmd
docker-compose down
```

### Dừng và xóa data

```cmd
docker-compose down -v
```

### Xóa tất cả Docker

```cmd
docker system prune -a --volumes
```

⚠️ **Cảnh báo**: Lệnh này xóa ALL Docker data!

## 🔧 Troubleshooting

### Lỗi: Port đã được sử dụng

```cmd
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process đó
taskkill /PID <số_PID> /F
```

### Lỗi: Docker không chạy

1. Mở Docker Desktop
2. Đợi cho đến khi nó ready (icon không chuyển động)
3. Chạy lại `docker-dev.bat`

### Container không start

```cmd
# Xem logs để biết lỗi
docker-compose logs

# Hoặc xem log của từng service
docker logs lms-backend-dev
docker logs lms-mongodb
```

### Reset tất cả

```cmd
# Dừng và xóa mọi thứ
docker-compose down -v

# Khởi động lại
docker-dev.bat
```

## 📝 So sánh Docker vs Local

| Tính năng            | Local Install        | Docker        |
| -------------------- | -------------------- | ------------- |
| Cài MongoDB          | Phải cài thủ công    | Tự động       |
| Cài dependencies     | npm install          | Tự động       |
| Cấu hình phức tạp    | Phải config thủ công | Có sẵn        |
| Xung đột version     | Có thể xảy ra        | Không bao giờ |
| Cleanup              | Khó                  | 1 lệnh        |
| Database GUI         | Phải cài riêng       | Có sẵn        |
| Production giống dev | Khó đảm bảo          | Giống 100%    |

## 🎯 Workflow làm việc

### Ngày làm việc bình thường

1. **Sáng: Khởi động**

    ```cmd
    docker-dev.bat
    ```

2. **Viết code**

    - Mở VS Code
    - Sửa file trong `src/`
    - Backend tự động reload

3. **Test API**

    - Mở http://localhost:5000/api-docs
    - Test các endpoint

4. **Xem logs**

    ```cmd
    docker-compose logs -f
    ```

5. **Chiều: Dừng**
    ```cmd
    docker-compose down
    ```

### Khi push code lên Git

```cmd
git add .
git commit -m "feature: add something"
git push
```

Docker files đã được config trong `.gitignore`, không push lên Git.

## 🚀 Deploy Production

Khi sẵn sàng deploy:

```cmd
# Tạo file config production
copy .env.docker .env.production

# Sửa file .env.production với thông tin thật
notepad .env.production

# Chạy production
docker-prod.bat
```

## 📚 Tài liệu chi tiết

-   **Hướng dẫn đầy đủ**: [DOCKER.md](DOCKER.md)
-   **Quick Reference**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
-   **Tổng kết**: [DOCKER_COMPLETE.md](DOCKER_COMPLETE.md)

## 💡 Tips

1. **Luôn check Docker Desktop đang chạy** trước khi run lệnh
2. **Dùng Swagger UI** để test API, rất tiện
3. **Dùng Mongo Express** để xem data trực quan
4. **Backup thường xuyên** bằng `.\docker.ps1 backup`
5. **Xem logs** khi có lỗi: `docker-compose logs -f`

## ✅ Checklist

-   [ ] Docker Desktop đã cài và đang chạy
-   [ ] Chạy `docker-dev.bat`
-   [ ] Truy cập http://localhost:5000/api-docs
-   [ ] Test đăng ký và đăng nhập
-   [ ] Kiểm tra MongoDB ở http://localhost:8081
-   [ ] Code trong `src/` và thấy auto-reload

## 🎉 Xong!

Giờ bạn có:

-   ✅ Backend API với JWT, Swagger
-   ✅ MongoDB đang chạy
-   ✅ Database GUI (Mongo Express)
-   ✅ Auto-reload khi code thay đổi
-   ✅ Không cần cài gì thêm!

**Bắt đầu code thôi!** 🚀

---

Có câu hỏi? Xem file [DOCKER.md](DOCKER.md) hoặc [README.md](README.md)
