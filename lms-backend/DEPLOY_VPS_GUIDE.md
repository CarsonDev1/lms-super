# 🚀 Hướng Dẫn Deploy Backend Lên VPS - backendlearning.xyz

## 📋 Điều kiện tiên quyết

-   ✅ SSH vào VPS thành công
-   ✅ Tên miền: `backendlearning.xyz`
-   ✅ OS: Ubuntu 25.04 LTS
-   ✅ IP: 222.255.119.33

---

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1. Update hệ thống

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2. Cài đặt Docker & Docker Compose

```bash
# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo apt install -y docker-compose

# Thêm user vào docker group (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 1.3. Kiểm tra cài đặt

```bash
docker --version
docker-compose --version
```

### 1.4. Cài git & wget

```bash
sudo apt install -y git wget curl
```

---

## 📥 Bước 2: Clone & Setup Source Code

### 2.1. Clone repository

```bash
cd /home
git clone <your-repo-url> lms-backend
cd lms-backend
```

**Hoặc nếu bạn muốn sử dụng source hiện có:**

```bash
# Upload source từ local lên VPS
scp -r /path/to/lms-backend root@222.255.119.33:/home/
ssh root@222.255.119.33
cd /home/lms-backend
```

### 2.2. Tạo file .env từ .env.docker

```bash
cp .env.docker .env
```

---

## 🔑 Bước 3: Cấu Hình Environment Variables

### 3.1. Chỉnh sửa file `.env`

```bash
nano .env
```

**Các giá trị quan trọng cần thay đổi:**

```dotenv
# Application
NODE_ENV=production
PORT=5000
API_URL=https://backendlearning.xyz
FRONTEND_URL=https://your-frontend-domain.com

# MongoDB - Đổi password mạnh
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=YOUR_STRONG_MONGODB_PASSWORD_HERE

# JWT - Tạo secret ngẫu nhiên mạnh
JWT_ACCESS_SECRET=YOUR_RANDOM_JWT_ACCESS_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_RANDOM_JWT_REFRESH_SECRET_HERE
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
JWT_ISSUER=lms-backend
JWT_AUDIENCE=lms-client

# CORS - Cho phép frontend
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info

# Email Service (tuỳ chọn)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth & Payment (tuỳ chọn)
GOOGLE_CLIENT_ID=...
CLOUDINARY_API_SECRET=...
```

**💡 Cách tạo random secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.2. Lưu file (.env)

-   Nhấn `Ctrl + O` → `Enter` → `Ctrl + X` để lưu

---

## 🐳 Bước 4: Chạy Docker Compose

### 4.1. Build & khởi động services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4.2. Kiểm tra containers

```bash
docker ps
```

Bạn sẽ thấy:

-   `lms-backend-prod` - Backend Node.js
-   `lms-mongodb-prod` - MongoDB Database
-   `lms-nginx` - Nginx Reverse Proxy

### 4.3. Xem logs

```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 4.4. Kiểm tra health

```bash
curl http://localhost:5000/health
```

---

## 🌐 Bước 5: Cấu Hình Domain & SSL (HTTPS)

### 5.1. Cấu hình DNS

Trỏ `backendlearning.xyz` về IP VPS `222.255.119.33`

Tại nhà cung cấp domain:

-   Type: A
-   Name: backendlearning.xyz (hoặc @)
-   Value: 222.255.119.33
-   TTL: 3600

**⏳ Chờ 5-30 phút để DNS propagate**

### 5.2. Cài đặt Certbot (SSL Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Tạo chứng chỉ SSL
sudo certbot certonly --standalone -d backendlearning.xyz

# Hoặc nếu nginx đã chạy:
sudo certbot certonly --webroot -w /var/www/certbot -d backendlearning.xyz
```

### 5.3. Cấu hình Nginx cho SSL

Tạo file `nginx/nginx.conf`:

```bash
mkdir -p nginx
nano nginx/nginx.conf
```

Thêm nội dung:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;

    upstream backend {
        server backend:5000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name backendlearning.xyz;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name backendlearning.xyz;

        ssl_certificate /etc/letsencrypt/live/backendlearning.xyz/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/backendlearning.xyz/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # API routes with rate limiting
        location /api/auth {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            limit_req zone=api_limit burst=50 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Swagger docs
        location /api-docs {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Socket.io
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            root /usr/share/nginx/html;
            try_files $uri /index.html;
        }
    }
}
```

Lưu file: `Ctrl + O` → `Enter` → `Ctrl + X`

### 5.4. Cấu hình SSL folders

```bash
mkdir -p nginx/ssl

# Copy chứng chỉ SSL
sudo cp /etc/letsencrypt/live/backendlearning.xyz/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/backendlearning.xyz/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
sudo chmod 644 nginx/ssl/*
```

### 5.5. Khởi động lại Docker Compose

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## ✅ Bước 6: Kiểm Tra & Thử Nghiệm

### 6.1. Kiểm tra API

```bash
# HTTP -> HTTPS redirect
curl -i http://backendlearning.xyz/

# API health
curl -i https://backendlearning.xyz/health

# Swagger docs
curl -i https://backendlearning.xyz/api-docs
```

### 6.2. Test từ browser

-   API: `https://backendlearning.xyz`
-   Swagger: `https://backendlearning.xyz/api-docs`
-   Health: `https://backendlearning.xyz/health`

---

## 🔄 Bước 7: Auto Renewal SSL

### 7.1. Tạo renewal script

```bash
sudo nano /etc/letsencrypt/renewal-hooks/post/docker-reload.sh
```

Thêm:

```bash
#!/bin/bash
docker-compose -f /home/lms-backend/docker-compose.prod.yml restart nginx
```

### 7.2. Cho phép execute

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/docker-reload.sh
```

### 7.3. Cấu hình cron (auto renewal)

```bash
sudo crontab -e
```

Thêm dòng:

```
0 12 * * * /usr/bin/certbot renew --quiet --post-hook "docker-compose -f /home/lms-backend/docker-compose.prod.yml restart nginx"
```

---

## 📊 Bước 8: Monitoring & Logs

### 8.1. Xem logs backend

```bash
docker-compose -f docker-compose.prod.yml logs -f backend --tail=100
```

### 8.2. Xem logs MongoDB

```bash
docker-compose -f docker-compose.prod.yml logs -f mongodb --tail=50
```

### 8.3. Xem logs Nginx

```bash
docker-compose -f docker-compose.prod.yml logs -f nginx --tail=100
```

### 8.4. Truy cập MongoDB

```bash
docker exec -it lms-mongodb-prod mongosh -u admin -p 'your_password' admin
```

---

## 🚨 Troubleshooting

### Backend không chạy

```bash
# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs backend

# Restart
docker-compose -f docker-compose.prod.yml restart backend
```

### DNS không hoạt động

```bash
# Kiểm tra DNS resolution
nslookup backendlearning.xyz
dig backendlearning.xyz
```

### SSL certificate error

```bash
# Check cert validity
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Port bị chiếm

```bash
# Kiểm tra port 80, 443, 5000
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5000
```

---

## 🎯 Tóm Tắt Lệnh Quan Trọng

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart
docker-compose -f docker-compose.prod.yml restart backend

# Update code
cd /home/lms-backend && git pull
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📝 Checklist Deploy

-   [ ] SSH vào VPS thành công
-   [ ] Cài đặt Docker & Docker Compose
-   [ ] Clone/upload source code
-   [ ] Tạo & cấu hình file `.env`
-   [ ] Chạy `docker-compose up -d`
-   [ ] Kiểm tra containers `docker ps`
-   [ ] Cấu hình DNS
-   [ ] Cài đặt SSL certificate
-   [ ] Cấu hình Nginx
-   [ ] Test HTTPS connection
-   [ ] Cấu hình auto renewal
-   [ ] Thiết lập monitoring

---

## 🎉 Hoàn Tất!

Backend của bạn đã live tại **https://backendlearning.xyz**

**Các endpoint quan trọng:**

-   API: `https://backendlearning.xyz/api`
-   Swagger Docs: `https://backendlearning.xyz/api-docs`
-   Health Check: `https://backendlearning.xyz/health`
