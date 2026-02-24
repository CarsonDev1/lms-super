# 📚 LMS Platform — Business & API Documentation

> **Hệ thống**: Learning Management System (LMS) — CarsonDev1  
> **Backend**: Node.js + Express + MongoDB  
> **Production**: `http://backendlearning.xyz`  
> **Auth**: JWT Bearer Token (Access Token + Refresh Token)  
> **Cập nhật**: 2026-02-24

---

## 🗺️ Tổng quan hệ thống

Đây là nền tảng học trực tuyến (LMS) cho phép:

| Đối tượng      | Mô tả                                           |
| -------------- | ----------------------------------------------- |
| **Student**    | Đăng ký khoá học, học, làm quiz, nhận chứng chỉ |
| **Instructor** | Tạo & quản lý khoá học, quiz, xem doanh thu     |
| **Reviewer**   | Duyệt khoá học, viết feedback                   |
| **Admin**      | Toàn quyền quản trị hệ thống                    |

---

## 1. 🔐 Auth — Xác thực người dùng

**Base route:** `/api/auth`

| Method | Endpoint               | Mô tả                                                 | Access  |
| ------ | ---------------------- | ----------------------------------------------------- | ------- |
| POST   | `/register`            | Đăng ký tài khoản mới với name, email, password, role | Public  |
| POST   | `/login`               | Đăng nhập, trả về `accessToken` + `refreshToken`      | Public  |
| POST   | `/refresh`             | Làm mới accessToken khi hết hạn                       | Public  |
| POST   | `/logout`              | Đăng xuất (xoá session hiện tại)                      | Private |
| POST   | `/logout-all`          | Đăng xuất tất cả thiết bị                             | Private |
| GET    | `/me`                  | Lấy thông tin profile người dùng đang đăng nhập       | Private |
| GET    | `/sessions`            | Danh sách session đang active (multi-device)          | Private |
| DELETE | `/sessions/:sessionId` | Xoá một session cụ thể                                | Private |
| GET    | `/google`              | Đăng nhập bằng Google OAuth                           | Public  |
| GET    | `/google/callback`     | Callback sau OAuth Google                             | Public  |
| GET    | `/facebook`            | Đăng nhập bằng Facebook OAuth                         | Public  |
| GET    | `/facebook/callback`   | Callback sau OAuth Facebook                           | Public  |

### Model: User

```
name, email, password (bcrypt), role [student|instructor|admin|reviewer|guest|user],
avatar, bio, phone, oauthProvider, oauthId, isEmailVerified,
isActive, isBlocked, blockReason, lastLogin, lastSeen, isOnline
```

**Business logic:**

- Password bắt buộc với tài khoản thường, không bắt buộc nếu đăng nhập OAuth
- Access Token ngắn hạn (15-60 phút), Refresh Token dài hạn (lưu vào Session)
- Hỗ trợ multi-device login — mỗi device có 1 Session riêng

---

## 2. 📚 Courses — Quản lý khoá học

**Base route:** `/api/courses`

| Method | Endpoint | Mô tả                                                                 | Access                       |
| ------ | -------- | --------------------------------------------------------------------- | ---------------------------- |
| GET    | `/`      | Lấy danh sách khoá học **đã published** (filter: categoryId, levelId) | Public                       |
| GET    | `/:id`   | Lấy chi tiết một khoá học                                             | Public                       |
| POST   | `/`      | Tạo khoá học mới (status mặc định: `draft`)                           | Instructor, Admin            |
| PUT    | `/:id`   | Cập nhật khoá học                                                     | Instructor (của mình), Admin |
| DELETE | `/:id`   | Xoá khoá học                                                          | Instructor (của mình), Admin |

### Model: Course

```
title, slug (auto-gen), description, instructor (ref User),
thumbnail, previewVideo, categoryId (ref Category), levelId (ref Level),
tags[], language, price, discount (%),
curriculum: [{ title, order, lessons: [{ title, videoUrl, duration, isFree, resources[] }] }],
status [draft|pending|approved|published|archived],
ratings: { average, count }, totalStudents,
auditLog[], reviewedBy, reviewComment, publishedAt, featured
```

**Business logic — vòng đời khoá học:**

```
draft → [Instructor submit] → pending → [Reviewer review]
  ├── approved → published ✅
  ├── rejected → instructor chỉnh sửa → pending (lại)
  └── revision_required → instructor sửa → pending (lại)
```

- Validation bắt buộc: `title`, `description`, `categoryId`, `duration`, `price`
- Slug tự động tạo từ title khi save lần đầu
- Chỉ khoá học `published` visible với public

---

## 3. ✅ Course Approvals — Quy trình duyệt khoá học

**Base route:** `/api/course-approvals`

| Method | Endpoint                | Mô tả                                      | Access          |
| ------ | ----------------------- | ------------------------------------------ | --------------- |
| POST   | `/submit`               | Instructor nộp khoá học để duyệt           | Instructor      |
| GET    | `/my-submissions`       | Instructor xem lịch sử submission của mình | Instructor      |
| GET    | `/`                     | Xem tất cả submissions cần duyệt           | Admin, Reviewer |
| GET    | `/:id`                  | Chi tiết một submission                    | Admin, Reviewer |
| POST   | `/:id/feedback`         | Reviewer thêm feedback/comment             | Admin, Reviewer |
| POST   | `/:id/approve`          | Duyệt khoá học (course → `approved`)       | Admin, Reviewer |
| POST   | `/:id/reject`           | Từ chối khoá học (kèm lý do)               | Admin, Reviewer |
| POST   | `/:id/request-revision` | Yêu cầu sửa (kèm deadline)                 | Admin, Reviewer |
| PUT    | `/:id/checklist`        | Cập nhật checklist review                  | Admin, Reviewer |

### Model: CourseApproval

```
courseId, versionId, submittedBy, submittedAt, reviewedBy, reviewedAt,
status [pending|under_review|approved|rejected|revision_required],
priority [low|medium|high|urgent],
submissionType [new|update|revision],
submissionNotes, reviewNotes,
feedback: [{ reviewerId, comment, type [suggestion|required_change|question|praise], section, status }],
checklist: { contentQuality, technicalAccuracy, videoQuality, materialsComplete, curriculumStructure, compliance },
rejectionReason, revisionDeadline, history[]
```

**Business logic:**

- Mỗi lần nộp tạo một record `CourseApproval` mới (lưu toàn bộ lịch sử)
- Reviewer có thể để lại nhiều feedback theo từng section nội dung
- Checklist 6 tiêu chí giúp reviewer đánh giá có hệ thống

---

## 4. 📂 Categories — Danh mục khoá học

**Base route:** `/api/categories`

| Method | Endpoint | Mô tả               | Access |
| ------ | -------- | ------------------- | ------ |
| GET    | `/`      | Lấy tất cả danh mục | Public |
| GET    | `/:id`   | Chi tiết danh mục   | Public |
| POST   | `/`      | Tạo danh mục mới    | Admin  |
| PUT    | `/:id`   | Sửa danh mục        | Admin  |
| DELETE | `/:id`   | Xoá danh mục        | Admin  |

**Business logic:** Danh mục được dùng để phân loại khoá học. Ví dụ: `Lập trình`, `Thiết kế`, `Marketing`...

---

## 5. 🎯 Levels — Cấp độ khoá học

**Base route:** `/api/levels`

| Method | Endpoint | Mô tả                               | Access |
| ------ | -------- | ----------------------------------- | ------ |
| GET    | `/`      | Lấy tất cả levels (sort theo order) | Public |
| GET    | `/:id`   | Chi tiết level                      | Public |
| POST   | `/`      | Tạo level mới (order tự động tăng)  | Admin  |
| PUT    | `/:id`   | Sửa level                           | Admin  |
| DELETE | `/:id`   | Xoá level                           | Admin  |

**Business logic:**

- Level dùng để gắn tag độ khó cho khoá học: VD: `Beginner`, `Intermediate`, `Advanced`
- `order` tự động gán = max(order hiện tại) + 1 nếu không cung cấp
- Sort mặc định: `{ order: 1, name: 1 }`

---

## 6. 📝 Enrollments — Ghi danh & tiến độ học

**Base route:** `/api/enrollments`

| Method | Endpoint                 | Mô tả                                      | Access  |
| ------ | ------------------------ | ------------------------------------------ | ------- |
| POST   | `/`                      | Ghi danh vào khoá học                      | Student |
| GET    | `/my-courses`            | Danh sách khoá học đã ghi danh             | Student |
| GET    | `/:courseId/progress`    | Xem tiến độ học một khoá                   | Student |
| PUT    | `/:courseId/progress`    | Cập nhật tiến độ bài học (đánh dấu đã xem) | Student |
| POST   | `/:courseId/certificate` | Tạo chứng chỉ hoàn thành                   | Student |
| POST   | `/:courseId/notes`       | Thêm ghi chú vào bài học                   | Student |

### Model: Enrollment

```
userId, courseId,
progress: [{ lessonId, completed, watchTime (giây), lastWatched }],
completionPercentage (0-100%), certificateIssued, certificateUrl, completedAt,
enrolledAt, lastAccessedAt,
notes: [{ lessonId, content, timestamp (video second), createdAt }],
bookmarks: [{ lessonId, timestamp, title }]
```

**Business logic:**

- Mỗi user chỉ có 1 enrollment/khoá (compound unique index)
- `completionPercentage` tự tính: `(completedLessons / totalLessons) * 100`
- Khi 100% → set `completedAt` → có thể cấp chứng chỉ
- Ghi chú và bookmark lưu theo timestamp video

---

## 7. 🛒 Orders & Payment — Thanh toán

**Base route:** `/api/orders`

| Method | Endpoint           | Mô tả                           | Access          |
| ------ | ------------------ | ------------------------------- | --------------- |
| POST   | `/create`          | Tạo đơn hàng mới                | Student         |
| POST   | `/:orderId/vietqr` | Tạo QR VietQR để thanh toán     | Student         |
| POST   | `/:orderId/sepay`  | Tạo payment qua SePay           | Student         |
| POST   | `/webhook`         | Nhận webhook từ cổng thanh toán | Public (signed) |
| GET    | `/my-orders`       | Lịch sử đơn hàng của user       | Student         |
| GET    | `/:orderId`        | Chi tiết một đơn hàng           | Student         |
| POST   | `/:orderId/refund` | Yêu cầu hoàn tiền               | Student         |

### Model: Order

```
userId, courseId, amount, originalAmount, couponCode, discountAmount,
paymentMethod [sepay|vietqr|manual], paymentStatus [pending|processing|completed|failed|refunded|cancelled],
transactionId (auto-gen: TXN<timestamp><random>), sepayOrderId, qrCode,
paymentDetails: { bankCode, accountNumber, accountName, content },
refundDetails: { reason, refundedAt, refundedBy, amount },
invoiceUrl, completedAt, expiredAt
```

**Business logic:**

- Hỗ trợ 2 cổng thanh toán: VietQR (QR banking) và SePay
- Webhook tự động cập nhật `paymentStatus` → khi `completed` → auto tạo Enrollment
- Coupon được validate và discount trước khi tạo order
- Pending payment có `expiredAt` (tự cancel nếu quá hạn)

---

## 8. 🛍️ Cart & Wishlist — Giỏ hàng & Danh sách yêu thích

**Base route:** `/api` (wishlist và cart chung route file)

### Cart

| Method | Endpoint              | Mô tả                 |
| ------ | --------------------- | --------------------- |
| GET    | `/cart`               | Xem giỏ hàng          |
| POST   | `/cart`               | Thêm khoá học vào giỏ |
| DELETE | `/cart/:courseId`     | Xoá một khoá khỏi giỏ |
| POST   | `/cart/apply-coupon`  | Áp mã giảm giá        |
| DELETE | `/cart/remove-coupon` | Bỏ mã giảm giá        |
| DELETE | `/cart/clear`         | Xoá toàn bộ giỏ       |

### Wishlist

| Method | Endpoint              | Mô tả                  |
| ------ | --------------------- | ---------------------- |
| GET    | `/wishlist`           | Danh sách yêu thích    |
| POST   | `/wishlist`           | Thêm khoá vào wishlist |
| DELETE | `/wishlist/:courseId` | Xoá khỏi wishlist      |

---

## 9. 🎟️ Coupons — Mã giảm giá

**Base route:** `/api/coupons`

| Method | Endpoint          | Mô tả                       | Access |
| ------ | ----------------- | --------------------------- | ------ |
| GET    | `/`               | Danh sách tất cả coupon     | Admin  |
| POST   | `/`               | Tạo coupon mới              | Admin  |
| GET    | `/:couponId`      | Chi tiết coupon             | Admin  |
| PUT    | `/:couponId`      | Sửa coupon                  | Admin  |
| DELETE | `/:couponId`      | Xoá coupon                  | Admin  |
| POST   | `/validate/:code` | Validate mã coupon (public) | Public |

**Business logic:**

- Coupon có thể giảm theo `%` hoặc số tiền cố định
- Có thể giới hạn số lần dùng (`usageLimit`) và ngày hết hạn
- Áp dụng cho toàn bộ giỏ hàng hoặc khoá học cụ thể

---

## 10. ⭐ Reviews — Đánh giá khoá học

**Base route:** `/api/reviews`

| Method | Endpoint             | Mô tả                          | Access         |
| ------ | -------------------- | ------------------------------ | -------------- |
| POST   | `/`                  | Viết đánh giá (sau khi enroll) | Student        |
| GET    | `/course/:courseId`  | Đánh giá của một khoá học      | Public         |
| PUT    | `/:reviewId`         | Sửa đánh giá của mình          | Student        |
| DELETE | `/:reviewId`         | Xoá đánh giá                   | Student, Admin |
| POST   | `/:reviewId/helpful` | Like/unlike đánh giá           | Student        |
| POST   | `/:reviewId/reply`   | Instructor phản hồi đánh giá   | Instructor     |

**Business logic:**

- Chỉ student đã enroll mới được review
- Rating 1-5 sao → cập nhật `ratings.average` và `ratings.count` trong Course

---

## 11. 💬 Comments — Bình luận trong khoá học

**Base route:** `/api/comments`

| Method | Endpoint              | Mô tả                         | Access        |
| ------ | --------------------- | ----------------------------- | ------------- |
| POST   | `/`                   | Tạo comment (trả lời bài học) | Student       |
| GET    | `/course/:courseId`   | Lấy comments của khoá học     | Public        |
| GET    | `/:commentId/replies` | Lấy replies của comment       | Public        |
| PUT    | `/:commentId`         | Sửa comment                   | Author        |
| DELETE | `/:commentId`         | Xoá comment                   | Author, Admin |
| POST   | `/:commentId/like`    | Like/unlike comment           | Student       |

---

## 12. 🏆 Gamification — Điểm thưởng & Thành tích

**Base route:** `/api/gamification`

| Method | Endpoint                       | Mô tả                                     | Access  |
| ------ | ------------------------------ | ----------------------------------------- | ------- |
| GET    | `/achievements`                | Danh sách tất cả achievements             | Public  |
| POST   | `/achievements`                | Tạo achievement mới                       | Admin   |
| GET    | `/leaderboard`                 | Bảng xếp hạng người dùng                  | Public  |
| GET    | `/progress`                    | Tiến trình gamification của user hiện tại | Private |
| POST   | `/progress/add-xp`             | Cộng XP cho user                          | Admin   |
| POST   | `/progress/add-cups`           | Cộng cups cho user                        | Admin   |
| POST   | `/progress/unlock-achievement` | Mở khoá achievement cho user              | Admin   |

### Model: Achievement

```
code (unique), name, description, type [badge|trophy|milestone|special],
category [learning|social|streak|completion|speed|perfection],
icon, color, rarity [common|rare|epic|legendary],
xpReward, cupsReward, requirements (flexible Mixed),
isActive, isSecret, order, stats.totalUnlocked
```

### Model: UserProgress

```
userId, level, xp, xpToNextLevel, totalXpEarned, cups, totalCupsEarned,
achievements: [{ achievementId, unlockedAt, progress }],
currentStreak, longestStreak, lastActivityDate, streakFreezeUsed,
dailyGoals: { xpGoal, minutesGoal, lessonsGoal },
todayProgress: { xpEarned, minutesStudied, lessonsCompleted },
stats: { totalLearningMinutes, totalLessonsCompleted, totalCoursesCompleted, totalQuizzesPassed, averageQuizScore, perfectQuizzes }
```

**Business logic:**

- XP level-up: ngưỡng tăng exponential (`xpToNextLevel * 1.5` mỗi level)
- Streak: học liên tiếp nhiều ngày → tăng streak
- Leaderboard xếp hạng global/weekly/monthly theo XP hoặc cups
- Achievement có thể là Secret (ẩn cho đến khi mở khoá)

---

## 13. 🗺️ Roadmap — Bản đồ học tập

**Base route:** `/api/roadmap`

| Method | Endpoint                                      | Mô tả                                         | Access            |
| ------ | --------------------------------------------- | --------------------------------------------- | ----------------- |
| GET    | `/courses/:courseId/levels`                   | Tất cả roadmap level của khoá                 | Public            |
| GET    | `/levels/:id`                                 | Chi tiết roadmap level                        | Public            |
| PUT    | `/levels/:id`                                 | Sửa roadmap level                             | Instructor, Admin |
| DELETE | `/levels/:id`                                 | Xoá roadmap level                             | Instructor, Admin |
| POST   | `/levels`                                     | Tạo roadmap level mới                         | Instructor, Admin |
| GET    | `/progress/courses/:courseId`                 | Xem tiến trình roadmap của user               | Student           |
| GET    | `/progress/levels/:levelId/check-unlock`      | Check xem user có thể mở khoá level này không | Student           |
| POST   | `/progress/levels/:levelId/unlock`            | Mở khoá một roadmap level                     | Student           |
| POST   | `/progress/levels/:levelId/complete`          | Đánh dấu hoàn thành level                     | Student           |
| POST   | `/progress/levels/:levelId/lessons/:lessonId` | Cập nhật tiến độ bài học trong level          | Student           |

### Model: RoadmapLevel

```
courseId, levelNumber, title, description, icon, color,
position: { x, y } (toạ độ hiển thị trên map),
unlockRequirements: { previousLevel, minXP, minCups, requiredAchievements[], requiredLessons[] },
lessons: [{ lessonId, order, isRequired }],
rewards: { xp, cups, badge (ref Achievement) },
estimatedDuration (minutes), difficulty [beginner|intermediate|advanced|expert],
isActive, stats: { totalStarted, totalCompleted, averageCompletionTime }
```

**Business logic:**

- Roadmap là bản đồ hình ảnh của quá trình học trong mỗi khoá
- Level có thể yêu cầu điều kiện mở khoá: hoàn thành level trước, đủ XP, đủ cups, có achievement nhất định
- Hoàn thành level → nhận XP + cups + badge reward

---

## 14. 📅 Study Plans — Kế hoạch học tập

**Base route:** `/api/study-plans`

| Method | Endpoint                            | Mô tả                          | Access  |
| ------ | ----------------------------------- | ------------------------------ | ------- |
| POST   | `/generate`                         | Tạo kế hoạch học tập tự động   | Student |
| GET    | `/`                                 | Danh sách study plans của user | Student |
| GET    | `/:id`                              | Chi tiết study plan            | Student |
| GET    | `/:id/today`                        | Lấy session học của hôm nay    | Student |
| PUT    | `/:id/sessions/:sessionId/complete` | Đánh dấu hoàn thành session    | Student |
| POST   | `/:id/regenerate`                   | Tái tạo plan với params mới    | Student |

### Model: StudyPlan

```
userId, courseId, enrollmentId, title, description,
startDate, endDate, targetCompletionDate,
dailyStudyMinutes (15-480), studyDays [0-6] (0=CN),
sessions: [{ date, lessonIds[], duration, status [pending|completed|missed|rescheduled], completedAt, actualDuration }],
currentSession, status [active|paused|completed|abandoned],
preferences: { studyTimePreference [morning|afternoon|evening|night], reminderEnabled, reminderMinutesBefore },
stats: { completedSessions, missedSessions, totalStudyMinutes, averageCompletionRate, currentStreak, longestStreak },
metadata: { generatedBy [auto|manual|ai], regenerationCount, lastRegeneratedAt }
```

**Business logic:**

- System tự động schedule các session dựa trên: số phút/ngày, ngày học trong tuần, ngày target
- Mỗi session gồm danh sách lesson cần học trong buổi đó
- Tracking streak học liên tiếp riêng biệt với gamification streak
- Hỗ trợ regenerate plan nếu user thay đổi lịch

---

## 15. 📊 Analytics — Thống kê

**Base route:** `/api/analytics`

| Method | Endpoint                | Mô tả                      | Access            |
| ------ | ----------------------- | -------------------------- | ----------------- |
| GET    | `/admin/dashboard`      | Dashboard tổng quan Admin  | Admin             |
| GET    | `/instructor/dashboard` | Dashboard Instructor       | Instructor        |
| GET    | `/student/dashboard`    | Dashboard Student          | Student           |
| GET    | `/courses/:courseId`    | Thống kê chi tiết một khoá | Instructor, Admin |
| GET    | `/export`               | Export data ra CSV/Excel   | Admin             |

**Admin dashboard trả về:** Tổng users, courses, revenue, enrollments, top courses, recent activity  
**Instructor dashboard:** Tổng khoá, students, revenue (total + this month), avg rating, top courses  
**Student dashboard:** Khoá đang học, % hoàn thành, XP, streak, next session

---

## 16. 💰 Revenue — Báo cáo doanh thu

**Base route:** `/api/admin/revenue`

| Method | Endpoint | Mô tả                      | Access |
| ------ | -------- | -------------------------- | ------ |
| GET    | `/`      | Báo cáo doanh thu chi tiết | Admin  |

**Query params:** `startDate`, `endDate`

**Trả về:**

- `byPaymentMethod`: Doanh thu theo hình thức thanh toán (VietQR, SePay, Manual)
- `byInstructor`: Top instructor theo doanh thu
- `daily`: Revenue theo từng ngày

---

## 17. 👩‍💼 Admin — Quản trị người dùng

**Base route:** `/api/admin`

| Method | Endpoint                        | Mô tả                                             | Access |
| ------ | ------------------------------- | ------------------------------------------------- | ------ |
| GET    | `/dashboard`                    | Dashboard tổng quan                               | Admin  |
| GET    | `/users`                        | Danh sách tất cả users (filter, search, paginate) | Admin  |
| POST   | `/users`                        | Tạo user mới                                      | Admin  |
| GET    | `/users/:userId`                | Chi tiết user                                     | Admin  |
| PUT    | `/users/:userId`                | Cập nhật thông tin user                           | Admin  |
| DELETE | `/users/:userId`                | Xoá user                                          | Admin  |
| PUT    | `/users/:userId/block`          | Block/Unblock user                                | Admin  |
| POST   | `/users/:userId/reset-password` | Reset password, gửi link email                    | Admin  |
| GET    | `/users/statistics`             | Thống kê chi tiết user                            | Admin  |
| GET    | `/revenue`                      | Báo cáo doanh thu                                 | Admin  |
| GET    | `/courses/pending`              | Khoá học đang chờ duyệt                           | Admin  |

---

## 18. 📋 Quiz — Bài kiểm tra

**Base route:** `/api/quizzes`

| Method | Endpoint               | Mô tả                       | Access     |
| ------ | ---------------------- | --------------------------- | ---------- |
| POST   | `/`                    | Tạo quiz mới                | Instructor |
| GET    | `/course/:courseId`    | Lấy tất cả quiz của khoá    | Public     |
| GET    | `/:quizId`             | Chi tiết quiz               | Public     |
| PUT    | `/:quizId`             | Cập nhật quiz               | Instructor |
| DELETE | `/:quizId`             | Xoá quiz                    | Instructor |
| POST   | `/:quizId/submit`      | Nộp bài làm quiz            | Student    |
| GET    | `/attempts/:attemptId` | Kết quả một lần làm         | Student    |
| GET    | `/:quizId/attempts`    | Tất cả lần làm của quiz này | Instructor |

### Model: Quiz

```
courseId, title, description, questions[],
duration (phút), passingScore (%), maxAttempts,
isPublished, isActive, difficulty [easy|medium|hard]
```

**Business logic:**

- Quiz gắn với khoá học, student chỉ làm được nếu đã enroll
- Có thể giới hạn số lần làm (`maxAttempts`)
- Tự chấm điểm, so với `passingScore` để xác định pass/fail
- Kết quả lưu vào `QuizAttempt`

---

## 19. 📣 Announcements — Thông báo hệ thống

**Base route:** `/api/announcements`

| Method | Endpoint          | Mô tả                                   | Access  |
| ------ | ----------------- | --------------------------------------- | ------- |
| GET    | `/`               | Tất cả announcements                    | Admin   |
| POST   | `/`               | Tạo thông báo mới                       | Admin   |
| GET    | `/:id`            | Chi tiết thông báo                      | Admin   |
| PUT    | `/:id`            | Cập nhật thông báo                      | Admin   |
| DELETE | `/:id`            | Xoá thông báo                           | Admin   |
| GET    | `/active`         | Thông báo đang active với user hiện tại | Private |
| POST   | `/:id/view`       | Đánh dấu đã xem                         | Private |
| POST   | `/:id/dismiss`    | Ẩn thông báo                            | Private |
| PUT    | `/:id/activate`   | Kích hoạt thông báo                     | Admin   |
| PUT    | `/:id/deactivate` | Tắt thông báo                           | Admin   |

### Model: Announcement

```
title, content, type [info|warning|success|error|maintenance],
targetAudience [all|students|instructors|admins],
startDate, endDate, isActive, priority, isPinned,
viewedBy[], dismissedBy[]
```

**Business logic:**

- Thông báo có thể nhắm đến role cụ thể
- Hỗ trợ scheduling (startDate/endDate)
- User có thể dismiss để không thấy nữa

---

## 20. 📄 CMS Pages — Quản lý nội dung tĩnh

**Base route:** `/api/cms`

| Method | Endpoint               | Mô tả                                              | Access |
| ------ | ---------------------- | -------------------------------------------------- | ------ |
| GET    | `/pages`               | Tất cả pages (không filter status)                 | Public |
| GET    | `/pages/:slug`         | Lấy page theo slug (chỉ published)                 | Public |
| GET    | `/menu`                | Pages hiển thị trong menu (published + showInMenu) | Public |
| GET    | `/pages/id/:id`        | Page theo ID                                       | Admin  |
| POST   | `/pages`               | Tạo page mới                                       | Admin  |
| PUT    | `/pages/:id`           | Cập nhật page                                      | Admin  |
| DELETE | `/pages/:id`           | Xoá page                                           | Admin  |
| PUT    | `/pages/:id/publish`   | Publish page                                       | Admin  |
| PUT    | `/pages/:id/unpublish` | Unpublish page                                     | Admin  |

### Model: CMSPage

```
slug (unique, lowercase), title, content (HTML/Markdown), excerpt,
type [page|faq|policy|about|terms|privacy], status [draft|published|archived],
featuredImage, metaTitle, metaDescription, metaKeywords[],
author (ref User), publishedAt, lastEditedBy, viewCount,
order, showInMenu, menuTitle
```

**Business logic:**

- Page mới tạo có status `draft`, phải publish mới visible với public
- `showInMenu = true` → xuất hiện ở navigation menu frontend
- Dùng cho: Trang About Us, Terms, Privacy Policy, FAQ...

---

## 21. 🤖 Chatbot AI — Hỗ trợ tự động

**Base route:** `/api/chatbot`

| Method | Endpoint                                 | Mô tả                              | Access |
| ------ | ---------------------------------------- | ---------------------------------- | ------ |
| POST   | `/conversations`                         | Bắt đầu conversation mới           | Public |
| GET    | `/conversations`                         | Tất cả conversations               | Admin  |
| GET    | `/conversations/:sessionId`              | Conversation theo session          | Public |
| POST   | `/conversations/:sessionId/messages`     | Gửi tin nhắn                       | Public |
| POST   | `/conversations/:sessionId/capture-lead` | Thu thập thông tin khách tiềm năng | Public |
| POST   | `/conversations/:sessionId/transfer`     | Chuyển sang agent thật             | Public |
| POST   | `/conversations/:sessionId/close`        | Đóng conversation                  | Public |
| GET    | `/conversations/user/:userId`            | Conversations của một user         | Admin  |
| GET    | `/analytics`                             | Analytics chatbot                  | Admin  |

### Model: ChatbotConversation

```
sessionId, userId (optional - guest login), status [active|closed|transferred],
messages: [{ role [user|bot|agent], content, timestamp }],
leadInfo: { name, email, phone, interest },
transferredTo (agent userId), closedAt
```

**Business logic:**

- Chatbot hỗ trợ cả khách vãng lai (không cần đăng nhập)
- Tự động trả lời câu hỏi về khoá học, giá, tính năng
- Khi không xử lý được → `transfer` sang human agent
- Lead capture: thu thập email/phone để remarketing

---

## 22. 💬 Chat trực tiếp — Nhắn tin

**Base route:** `/api/chat`

| Method | Endpoint             | Mô tả                          | Access  |
| ------ | -------------------- | ------------------------------ | ------- |
| GET    | `/conversations`     | Danh sách cuộc trò chuyện      | Private |
| GET    | `/messages/:userId`  | Tin nhắn với một user          | Private |
| POST   | `/send`              | Gửi tin nhắn                   | Private |
| PUT    | `/mark-read/:userId` | Đánh dấu đã đọc tất cả từ user | Private |
| GET    | `/unread-count`      | Số tin chưa đọc                | Private |
| DELETE | `/:messageId`        | Xoá tin nhắn                   | Author  |

**Business logic:** Chat 1-1 giữa student và instructor. Realtime qua Socket.io (WebSocket).

---

## 23. 🔔 Notifications — Thông báo realtime

**Base route:** `/api/notifications`

| Method | Endpoint                | Mô tả                 | Access  |
| ------ | ----------------------- | --------------------- | ------- |
| GET    | `/`                     | Danh sách thông báo   | Private |
| PUT    | `/:notificationId/read` | Đánh dấu đã đọc       | Private |
| PUT    | `/mark-all-read`        | Đánh dấu đọc hết      | Private |
| DELETE | `/:notificationId`      | Xoá thông báo         | Private |
| DELETE | `/clear-all`            | Xoá tất cả đã đọc     | Private |
| GET    | `/unread-count`         | Số thông báo chưa đọc | Private |

### Model: Notification

```
userId, type [approval|rejection|enrollment|payment|review|system|achievement|chat],
title, message, data (metadata), isRead, readAt, link (deep link)
```

**Business logic:**

- Trigger tự động: khi khoá học được duyệt, từ chối, khi có student enroll, khi nhận payment...
- Realtime push qua Socket.io

---

## 24. 📁 Upload — Media management

**Base route:** `/api/upload`

| Method | Endpoint           | Mô tả                         | Access  |
| ------ | ------------------ | ----------------------------- | ------- |
| POST   | `/image`           | Upload 1 ảnh lên Cloudinary   | Private |
| POST   | `/video`           | Upload 1 video lên Cloudinary | Private |
| POST   | `/multiple`        | Upload nhiều file             | Private |
| DELETE | `/delete`          | Xoá file khỏi Cloudinary      | Private |
| DELETE | `/delete-multiple` | Xoá nhiều file                | Private |

**Business logic:**

- Tất cả media lưu trên Cloudinary
- Video tự động lấy duration từ Cloudinary response
- Trả về URL public để embed vào course/lesson

---

## 25. 📋 Audit Logs — Nhật ký hành động

**Base route:** `/api/audit-logs`

| Method | Endpoint                              | Mô tả                                | Access |
| ------ | ------------------------------------- | ------------------------------------ | ------ |
| GET    | `/`                                   | Tất cả audit logs (filter, paginate) | Admin  |
| GET    | `/:id`                                | Chi tiết một log                     | Admin  |
| GET    | `/resource/:resourceType/:resourceId` | Logs theo resource                   | Admin  |
| GET    | `/user/:userId`                       | Action history của một user          | Admin  |
| DELETE | `/cleanup`                            | Xoá logs cũ                          | Admin  |

### Model: AuditLog

```
action, userId, resource (type + id), details, ipAddress, userAgent, timestamp
```

**Business logic:**

- Tự động ghi lại: user login/logout, CRUD operations quan trọng
- Admin dùng để audit, phát hiện bất thường

---

## 📐 Data Model Relationships

```
User ──────────────────────────────────────────────────────────┐
 │                                                             │
 ├─ [instructor] ──→ Course ─────────────────────────────────┐ │
 │                      │                                    │ │
 │                      ├─→ CourseApproval                   │ │
 │                      ├─→ RoadmapLevel[]                   │ │
 │                      ├─→ Quiz[]                           │ │
 │                      └─→ Review[]                         │ │
 │                                                           │ │
 ├─ [student] ──→ Enrollment ──→ Course                      │ │
 │                   │                                       │ │
 │                   ├─→ StudyPlan                           │ │
 │                   ├─→ QuizAttempt[]                       │ │
 │                   └─→ Certificate                         │ │
 │                                                           │ │
 ├─→ Order ──→ Course                                        │ │
 ├─→ Cart ──→ Course[]                                       │ │
 ├─→ Wishlist ──→ Course[]                                   │ │
 ├─→ UserProgress ──→ Achievement[]                          │ │
 ├─→ Notification[]                                          │ │
 └─→ ChatMessage ──→ User                                    │ │
                                                             │ │
Category ──→ Course ─────────────────────────────────────────┘ │
Level ──────→ Course ──────────────────────────────────────────┘
```

---

## 🔑 Roles & Permissions

| Feature            | Student | Instructor    | Reviewer | Admin       |
| ------------------ | ------- | ------------- | -------- | ----------- |
| Xem khoá học       | ✅      | ✅            | ✅       | ✅          |
| Ghi danh khoá học  | ✅      | ❌            | ❌       | ❌          |
| Tạo/sửa khoá học   | ❌      | ✅ (của mình) | ❌       | ✅ (tất cả) |
| Duyệt khoá học     | ❌      | ❌            | ✅       | ✅          |
| Quản lý users      | ❌      | ❌            | ❌       | ✅          |
| Quản lý categories | ❌      | ❌            | ❌       | ✅          |
| Quản lý levels     | ❌      | ❌            | ❌       | ✅          |
| Quản lý coupons    | ❌      | ❌            | ❌       | ✅          |
| CMS Pages          | ❌      | ❌            | ❌       | ✅          |
| Achievements admin | ❌      | ❌            | ❌       | ✅          |
| Revenue reports    | ❌      | ✅ (của mình) | ❌       | ✅ (tất cả) |
| Audit logs         | ❌      | ❌            | ❌       | ✅          |
| Quiz management    | ❌      | ✅            | ❌       | ✅          |

---

## 🏗️ Tech Stack & Infrastructure

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| **Runtime**    | Node.js + Express.js                              |
| **Database**   | MongoDB + Mongoose                                |
| **Auth**       | JWT (Access + Refresh Token), Passport.js (OAuth) |
| **Storage**    | Cloudinary (images + videos)                      |
| **Payment**    | VietQR, SePay                                     |
| **Email**      | Nodemailer (SMTP)                                 |
| **Realtime**   | Socket.io (Chat, Notifications)                   |
| **Caching**    | In-memory (query store)                           |
| **Validation** | express-validator                                 |
| **Docs**       | Swagger/OpenAPI 3.0                               |

---

## 📊 Admin Panel Summary (lms-admin)

Trang Admin Panel được xây dựng với **React + TypeScript + Ant Design**, bao gồm:

| Module           | Route            | Mô tả                               |
| ---------------- | ---------------- | ----------------------------------- |
| Dashboard        | `/`              | KPI tổng quan, stats realtime       |
| Course Approvals | `/courses`       | Duyệt/từ chối khoá học              |
| Categories       | `/categories`    | CRUD danh mục                       |
| Levels           | `/levels`        | CRUD cấp độ                         |
| Users            | `/users`         | Quản lý user, block, reset password |
| Coupons          | `/coupons`       | Quản lý mã giảm giá                 |
| Announcements    | `/announcements` | Thông báo hệ thống                  |
| CMS Pages        | `/cms`           | Trang nội dung tĩnh                 |
| Achievements     | `/achievements`  | Quản lý huy hiệu thành tích         |
| Revenue          | `/revenue`       | Báo cáo doanh thu                   |
| Audit Logs       | `/audit-logs`    | Nhật ký hoạt động                   |

**Instructor Panel:**

| Module               | Route                     | Mô tả                       |
| -------------------- | ------------------------- | --------------------------- |
| Instructor Dashboard | `/instructor`             | KPI khoá học, doanh thu     |
| My Courses           | `/instructor/courses`     | CRUD khoá học, submit duyệt |
| My Quizzes           | `/instructor/quizzes`     | CRUD quiz                   |
| My Submissions       | `/instructor/submissions` | Theo dõi trạng thái duyệt   |
