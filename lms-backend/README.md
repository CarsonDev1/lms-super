# LMS Backend API

Professional Learning Management System Backend built with Express.js, MongoDB, JWT, and Swagger.

## 🚀 Features

-   ✅ **Express.js** - Fast, unopinionated web framework
-   ✅ **ES6+ Modules** - Modern JavaScript syntax
-   ✅ **MongoDB & Mongoose** - NoSQL database with elegant ODM
-   ✅ **JWT Authentication** - Secure token-based authentication
-   ✅ **Swagger/OpenAPI** - Interactive API documentation
-   ✅ **Express Validator** - Request validation
-   ✅ **Helmet** - Security headers
-   ✅ **CORS** - Cross-Origin Resource Sharing
-   ✅ **Rate Limiting** - Protect against brute force
-   ✅ **Morgan & Winston** - HTTP request logging
-   ✅ **Compression** - Gzip compression
-   ✅ **Error Handling** - Centralized error handling
-   ✅ **Role-Based Access Control** - Student, Instructor, Admin roles

## 📁 Project Structure

```
lms-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── jwt.js          # JWT configuration
│   │   ├── logger.js       # Winston logger setup
│   │   └── swagger.js      # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   └── courseController.js
│   ├── middlewares/
│   │   ├── auth.js         # JWT authentication & authorization
│   │   ├── errorHandler.js # Global error handling
│   │   └── validate.js     # Request validation
│   ├── models/
│   │   ├── User.js
│   │   └── Course.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── courseRoutes.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── courseValidator.js
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── logs/                  # Log files
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

### Option 1: Docker (Recommended) 🐳

**Quick Start:**

```bash
# Windows - Run development environment
docker-dev.bat

# Or using PowerShell
.\docker.ps1 dev

# Or using docker-compose directly
docker-compose up -d
```

**Access:**

-   Backend API: http://localhost:5000
-   Swagger Docs: http://localhost:5000/api-docs
-   Mongo Express: http://localhost:8081 (admin/admin123)

**Commands:**

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Access MongoDB shell
docker exec -it lms-mongodb mongosh -u admin -p admin123
```

📖 **Full Docker documentation**: See [DOCKER.md](DOCKER.md)

---

### Option 2: Local Installation

1. **Clone the repository**

```bash
cd lms-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms-database
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:

```bash
# Windows (if using MongoDB service)
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Run the application**

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

-   **Swagger UI**: http://localhost:5000/api-docs
-   **Health Check**: http://localhost:5000/health

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register a new user

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Using the access token

```bash
GET /api/auth/me
Authorization: Bearer <your-access-token>
```

## 🎯 API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/refresh` - Refresh access token
-   `GET /api/auth/me` - Get current user profile (protected)

### Courses

-   `GET /api/courses` - Get all courses (with pagination & filters)
-   `GET /api/courses/:id` - Get course by ID
-   `POST /api/courses` - Create new course (instructor/admin only)
-   `PUT /api/courses/:id` - Update course (instructor/admin only)
-   `DELETE /api/courses/:id` - Delete course (instructor/admin only)

## 👥 User Roles

-   **Student** - Can view courses and enroll
-   **Instructor** - Can create and manage their own courses
-   **Admin** - Full access to all resources

## 🔒 Security Features

-   **Helmet.js** - Sets security HTTP headers
-   **CORS** - Configured Cross-Origin Resource Sharing
-   **Rate Limiting** - 100 requests per 15 minutes per IP
-   **JWT** - Secure token-based authentication
-   **Bcrypt** - Password hashing with salt rounds
-   **Express Validator** - Input validation and sanitization
-   **MongoDB Injection Protection** - Via Mongoose sanitization

## 📝 Environment Variables

| Variable             | Description                          | Default                                |
| -------------------- | ------------------------------------ | -------------------------------------- |
| `NODE_ENV`           | Environment (development/production) | development                            |
| `PORT`               | Server port                          | 5000                                   |
| `MONGODB_URI`        | MongoDB connection string            | mongodb://localhost:27017/lms-database |
| `JWT_ACCESS_SECRET`  | JWT access token secret              | -                                      |
| `JWT_REFRESH_SECRET` | JWT refresh token secret             | -                                      |
| `JWT_ACCESS_EXPIRE`  | Access token expiration              | 15m                                    |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration             | 7d                                     |
| `CORS_ORIGIN`        | Allowed CORS origin                  | \*                                     |
| `LOG_LEVEL`          | Logging level                        | info                                   |

## 🧪 Testing

```bash
npm test
```

## 📦 Scripts

-   `npm start` - Start production server
-   `npm run dev` - Start development server with nodemon
-   `npm run lint` - Run ESLint
-   `npm run lint:fix` - Fix ESLint errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**CarsonDev1**

## 🙏 Acknowledgments

-   Express.js team for the amazing framework
-   MongoDB team for the powerful database
-   All open-source contributors

---

**Happy Coding! 🚀**
