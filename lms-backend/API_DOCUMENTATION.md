# LMS Backend API - Complete Documentation

## 🚀 Overview

Professional Learning Management System backend với đầy đủ tính năng EdTech hiện đại.

## ✨ Features Implemented

### 🔐 Core Features

-   ✅ JWT Authentication & Authorization
-   ✅ OAuth2 (Google, Facebook)
-   ✅ Role-based Access Control (RBAC)
-   ✅ Password Reset & Email Verification

### 📚 Course Management

-   ✅ Course CRUD với Curriculum Builder
-   ✅ Course Approval Workflow (Draft → Review → Published)
-   ✅ Course Versioning System
-   ✅ Categories & Levels
-   ✅ Enrollments & Progress Tracking

### 📅 Study Plan Engine

-   ✅ Personalized Study Plans
-   ✅ Adaptive Session Scheduling
-   ✅ Daily/Weekly Study Goals
-   ✅ Progress Tracking & Rescheduling
-   ✅ Catch-up Logic cho Missed Sessions

### 🗺️ Learning Roadmap

-   ✅ Level-based Progression
-   ✅ Unlock Requirements
-   ✅ Visual Roadmap với Position Mapping
-   ✅ Progress Sync với Study Plan

### 🎮 Gamification System

-   ✅ XP & Level System
-   ✅ Cups (Trophies)
-   ✅ Achievements & Badges
-   ✅ Daily/Weekly Streaks
-   ✅ Leaderboards
-   ✅ Daily Goals Tracking

### 📊 Analytics & Dashboards

-   ✅ Admin Dashboard (Revenue, Users, Courses)
-   ✅ Instructor Dashboard (Earnings, Students)
-   ✅ Student Dashboard (Progress, Statistics)
-   ✅ Course Analytics
-   ✅ Export Data (CSV/Excel)

### 🤖 AI Chatbot

-   ✅ Conversational AI Support
-   ✅ Course Recommendations
-   ✅ Lead Capture
-   ✅ Transfer to Human Agent
-   ✅ Conversation History

### 📢 CMS & Announcements

-   ✅ CMS Pages (About, FAQ, Policy)
-   ✅ Dynamic Content Management
-   ✅ Targeted Announcements
-   ✅ Scheduling & Expiration

### 📝 Audit & Security

-   ✅ Audit Log System
-   ✅ Activity Tracking
-   ✅ Change History
-   ✅ Security Best Practices

### 💳 Payment & Orders

-   ✅ Order Management
-   ✅ Payment Processing (VietQR, SePay)
-   ✅ Coupon System
-   ✅ Invoice Generation

### 💬 Social Features

-   ✅ Comments & Discussions
-   ✅ Reviews & Ratings
-   ✅ Real-time Chat
-   ✅ Notifications

### 📝 Learning Tools

-   ✅ Quizzes & Assessments
-   ✅ Auto-grading
-   ✅ Quiz Attempts Tracking
-   ✅ Certificates

## 📦 Tech Stack

-   **Runtime**: Node.js với ES6 Modules
-   **Framework**: Express.js
-   **Database**: MongoDB + Mongoose
-   **Authentication**: JWT + Passport.js
-   **Real-time**: Socket.io
-   **File Storage**: Cloudinary / AWS S3
-   **Documentation**: Swagger/OpenAPI 3.0
-   **Validation**: express-validator + Zod compatible
-   **Security**: Helmet, Rate Limiting, CORS

## 🗂️ Project Structure

```
lms-backend/
├── src/
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── StudyPlan.js
│   │   ├── Achievement.js
│   │   ├── UserProgress.js
│   │   ├── RoadmapLevel.js
│   │   ├── CourseApproval.js
│   │   ├── CMSPage.js
│   │   ├── Announcement.js
│   │   ├── ChatbotConversation.js
│   │   └── AuditLog.js
│   │
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── studyPlanController.js
│   │   ├── gamificationController.js
│   │   ├── roadmapController.js
│   │   ├── courseApprovalController.js
│   │   ├── cmsController.js
│   │   ├── announcementController.js
│   │   ├── chatbotController.js
│   │   └── analyticsController.js
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   ├── gamificationRoutes.js
│   │   ├── roadmapRoutes.js
│   │   ├── courseApprovalRoutes.js
│   │   ├── cmsRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── auditLogRoutes.js
│   │
│   ├── middlewares/         # Custom middlewares
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   ├── validate.js      # Input validation
│   │   ├── upload.js        # File upload
│   │   └── auditLog.js      # Audit logging
│   │
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── jwt.js
│   │   ├── passport.js
│   │   ├── swagger.js
│   │   ├── cloudinary.js
│   │   └── logger.js
│   │
│   ├── utils/               # Utility functions
│   ├── validators/          # Input validators
│   ├── services/            # Business logic services
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── .env.example            # Environment variables template
├── package.json
├── README.md
└── API_DOCUMENTATION.md    # This file
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install uuid package (for chatbot)
npm install uuid

# Copy environment file
cp .env.example .env

# Configure your .env file with:
# - MONGO_URI
# - JWT_SECRET
# - PORT
# - etc.
```

### Running

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Access Points

-   **API Base**: `http://localhost:5000/api`
-   **Swagger Docs**: `http://localhost:5000/api-docs`
-   **Health Check**: `http://localhost:5000/health`

## 📚 API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/logout` - Logout user
-   `POST /api/auth/refresh-token` - Refresh JWT token
-   `POST /api/auth/forgot-password` - Request password reset
-   `POST /api/auth/reset-password` - Reset password
-   `GET /api/auth/verify-email/:token` - Verify email

### Study Plans

-   `POST /api/study-plans/generate` - Generate personalized study plan
-   `GET /api/study-plans` - Get user's study plans
-   `GET /api/study-plans/:id` - Get study plan details
-   `GET /api/study-plans/:id/today` - Get today's session
-   `PUT /api/study-plans/:id/sessions/:sessionId/complete` - Complete session
-   `PUT /api/study-plans/:id/sessions/:sessionId/missed` - Mark session as missed
-   `PUT /api/study-plans/:id/sessions/:sessionId/reschedule` - Reschedule session
-   `POST /api/study-plans/:id/regenerate` - Regenerate plan
-   `PUT /api/study-plans/:id/preferences` - Update preferences
-   `DELETE /api/study-plans/:id` - Delete study plan

### Gamification

-   `GET /api/gamification/achievements` - Get all achievements
-   `GET /api/gamification/achievements/:id` - Get achievement by ID
-   `POST /api/gamification/achievements` - Create achievement (Admin)
-   `GET /api/gamification/progress` - Get user progress
-   `POST /api/gamification/progress/add-xp` - Add XP to user
-   `POST /api/gamification/progress/add-cups` - Add cups to user
-   `POST /api/gamification/progress/unlock-achievement` - Unlock achievement
-   `PUT /api/gamification/progress/daily-goals` - Update daily goals
-   `POST /api/gamification/progress/update-streak` - Update streak
-   `GET /api/gamification/leaderboard` - Get leaderboard
-   `GET /api/gamification/progress/ranking` - Get user ranking

### Roadmap & Levels

-   `GET /api/roadmap/courses/:courseId/levels` - Get course roadmap levels
-   `GET /api/roadmap/levels/:id` - Get level details
-   `POST /api/roadmap/levels` - Create level (Admin/Instructor)
-   `GET /api/roadmap/progress/courses/:courseId` - Get user's roadmap progress
-   `GET /api/roadmap/progress/levels/:levelId/check-unlock` - Check if level can be unlocked
-   `POST /api/roadmap/progress/levels/:levelId/unlock` - Unlock level
-   `POST /api/roadmap/progress/levels/:levelId/complete` - Complete level
-   `POST /api/roadmap/progress/levels/:levelId/lessons/:lessonId` - Update lesson progress

### Course Approvals

-   `POST /api/course-approvals/submit` - Submit course for approval
-   `GET /api/course-approvals` - Get all approvals (Admin/Reviewer)
-   `GET /api/course-approvals/my-submissions` - Get instructor's submissions
-   `GET /api/course-approvals/:id` - Get approval details
-   `POST /api/course-approvals/:id/feedback` - Add feedback
-   `POST /api/course-approvals/:id/approve` - Approve course
-   `POST /api/course-approvals/:id/reject` - Reject course
-   `POST /api/course-approvals/:id/request-revision` - Request revision
-   `PUT /api/course-approvals/:id/checklist` - Update checklist

### CMS

-   `GET /api/cms/pages` - Get all pages
-   `GET /api/cms/pages/:slug` - Get page by slug
-   `POST /api/cms/pages` - Create page (Admin)
-   `PUT /api/cms/pages/:id` - Update page (Admin)
-   `PUT /api/cms/pages/:id/publish` - Publish page (Admin)
-   `DELETE /api/cms/pages/:id` - Delete page (Admin)
-   `GET /api/cms/menu` - Get menu pages

### Announcements

-   `GET /api/announcements` - Get all announcements
-   `GET /api/announcements/active` - Get active announcements for user
-   `GET /api/announcements/:id` - Get announcement by ID
-   `POST /api/announcements` - Create announcement (Admin)
-   `PUT /api/announcements/:id/activate` - Activate announcement (Admin)
-   `POST /api/announcements/:id/view` - Mark as viewed
-   `POST /api/announcements/:id/dismiss` - Dismiss announcement

### Chatbot

-   `POST /api/chatbot/conversations` - Start new conversation
-   `GET /api/chatbot/conversations/:sessionId` - Get conversation
-   `POST /api/chatbot/conversations/:sessionId/messages` - Send message
-   `POST /api/chatbot/conversations/:sessionId/capture-lead` - Capture lead info
-   `POST /api/chatbot/conversations/:sessionId/transfer` - Transfer to agent
-   `POST /api/chatbot/conversations/:sessionId/close` - Close conversation
-   `GET /api/chatbot/conversations` - Get all conversations (Admin)
-   `GET /api/chatbot/analytics` - Get chatbot analytics (Admin)

### Analytics

-   `GET /api/analytics/admin/dashboard` - Admin dashboard stats
-   `GET /api/analytics/instructor/dashboard` - Instructor dashboard stats
-   `GET /api/analytics/student/dashboard` - Student dashboard stats
-   `GET /api/analytics/courses/:courseId` - Course analytics
-   `GET /api/analytics/export` - Export analytics data (Admin)

### Audit Logs

-   `GET /api/audit-logs` - Get all audit logs (Admin)
-   `GET /api/audit-logs/:id` - Get log by ID (Admin)
-   `GET /api/audit-logs/resource/:resourceType/:resourceId` - Get resource logs
-   `GET /api/audit-logs/user/:userId` - Get user activity logs
-   `DELETE /api/audit-logs/cleanup` - Cleanup old logs (Admin)

## 🔑 Authentication

Hầu hết endpoints require JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

Token có thể lấy từ:

-   `POST /api/auth/login`
-   `POST /api/auth/register`

## 🎯 Role-based Access

-   **student**: Truy cập courses, enrollments, study plans, progress
-   **instructor**: + Tạo/quản lý courses, xem analytics của mình
-   **admin**: Full access tới tất cả endpoints
-   **reviewer**: Approve/reject courses

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔥 Advanced Features

### Study Plan Engine

-   Tự động generate study plan dựa trên:
    -   Thời gian học mỗi ngày
    -   Ngày học trong tuần
    -   Target completion date
-   Catch-up logic khi miss session
-   Regenerate plan khi thay đổi goals

### Gamification

-   XP system với level progression
-   Cups (trophies) system
-   Achievement system với requirements
-   Daily streaks tracking
-   Leaderboards (global, weekly, monthly)

### Roadmap System

-   Visual roadmap với levels
-   Unlock requirements (previous level, XP, cups)
-   Progress tracking per level
-   Reward system

### Course Approval Workflow

-   Multi-stage approval process
-   Feedback system
-   Checklist verification
-   Revision requests
-   Audit history

### AI Chatbot

-   Intent detection
-   Course recommendations
-   Lead capture
-   Transfer to human agent
-   Conversation history

## 🛡️ Security Features

-   Helmet.js for security headers
-   Rate limiting (1200 req/15min)
-   JWT with refresh tokens
-   Password hashing with bcrypt
-   Input validation
-   XSS protection
-   CORS configuration
-   Audit logging

## 📈 Performance

-   MongoDB indexing
-   Query optimization
-   Pagination support
-   Data caching (ready for Redis)
-   Compression middleware
-   Async/await pattern

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/lms

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Client URL
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# CORS
CORS_ORIGIN=*
```

## 📖 Documentation

Full API documentation available at `/api-docs` (Swagger UI)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC

## 👨‍💻 Author

CarsonDev1

---

**Note**: Đây là backend hoàn chỉnh với đầy đủ features cho một LMS platform production-ready. Tất cả APIs đã được implement và sẵn sàng sử dụng với frontend.
