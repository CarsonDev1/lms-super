# LMS System Flow - Complete Role-Based Documentation

## 📋 Table of Contents

-   [System Architecture](#system-architecture)
-   [Authentication Flow](#authentication-flow)
-   [Student Role Flow](#student-role-flow)
-   [Instructor Role Flow](#instructor-role-flow)
-   [Admin Role Flow](#admin-role-flow)
-   [Reviewer Role Flow](#reviewer-role-flow)
-   [Common Features](#common-features)

---

## 🏗️ System Architecture

### Tech Stack

```
Frontend: React + TypeScript + Vite
Backend: Node.js + Express + MongoDB
Authentication: JWT + Passport.js
Real-time: Socket.io
File Storage: Cloudinary
Documentation: Swagger/OpenAPI 3.0
```

### Database Models

```
Users, Courses, Categories, Levels
Enrollments, Progress, StudyPlans
Orders, Payments, Coupons
Reviews, Comments, Ratings
Quizzes, Attempts, Certificates
Notifications, ChatMessages
Achievements, UserProgress, RoadmapLevels
CourseApprovals, CMSPages, Announcements
AuditLogs, ChatbotConversations
```

---

## 🔐 Authentication Flow

### 1. User Registration

```mermaid
POST /api/auth/register
├─ Input: email, password, name, role
├─ Validation: email unique, password strength
├─ Hash password (bcrypt)
├─ Create user in DB
├─ Generate verification token
├─ Send verification email
└─ Return: JWT access token + refresh token
```

**Code Flow:**

1. `authController.register()` → Validate input
2. `User.create()` → Save to DB
3. `generateTokens()` → Create JWT
4. `sendVerificationEmail()` → Email service
5. Return tokens + user data

### 2. User Login

```mermaid
POST /api/auth/login
├─ Input: email, password
├─ Find user by email
├─ Compare password hash
├─ Check user status (active, blocked)
├─ Update lastLogin
├─ Generate tokens
└─ Return: JWT tokens + user profile
```

**Code Flow:**

1. `authController.login()` → Find user
2. `user.comparePassword()` → Verify password
3. Check `user.isBlocked`, `user.isActive`
4. `generateTokens()` → Create new JWT
5. Update `user.lastLogin`
6. Return auth response

### 3. OAuth Login (Google/Facebook)

```mermaid
GET /api/auth/google
├─ Redirect to Google OAuth
├─ User authorizes
├─ Callback with code
├─ Exchange code for tokens
├─ Get user profile
├─ Find or create user
└─ Return: JWT tokens
```

**Code Flow:**

1. `passport.authenticate('google')` → Redirect
2. Google callback with user data
3. `User.findOne({ googleId })` or create
4. `generateTokens()`
5. Return authenticated user

### 4. Token Refresh

```mermaid
POST /api/auth/refresh-token
├─ Input: refresh token
├─ Verify refresh token
├─ Check if valid
├─ Generate new access token
└─ Return: new access token
```

### 5. Middleware Authentication

```javascript
// Every protected route uses:
router.use(authenticate);  // JWT verification
router.use(authorize('admin', 'instructor'));  // Role check

// Flow:
authenticate() {
  1. Extract Bearer token from header
  2. Verify JWT signature
  3. Decode userId from token
  4. Load user from DB
  5. Attach user to req.user
  6. Check if blocked/inactive
  7. Continue to next middleware
}
```

---

## 👨‍🎓 Student Role Flow

### 1. Course Discovery & Enrollment

#### 1.1 Browse Courses

```mermaid
GET /api/courses
├─ Filter by: category, level, price, rating
├─ Sort by: popularity, newest, price
├─ Pagination support
└─ Return: course list with preview data
```

**Student Actions:**

-   Browse courses by category
-   Search courses by keyword
-   Filter by price range, level, rating
-   View course details and curriculum
-   Check instructor profile
-   Read reviews from other students

**Code Path:**

```javascript
// Frontend
CourseList.tsx → useFetch('/api/courses?category=...') → Display cards

// Backend
GET /api/courses → courseController.getCourses()
  → Course.find({ isPublished: true })
  → Apply filters (category, level, price)
  → Sort and paginate
  → Populate instructor and category
  → Return courses
```

#### 1.2 View Course Details

```mermaid
GET /api/courses/:id
├─ Course information
├─ Curriculum structure
├─ Instructor details
├─ Student reviews
├─ Prerequisites
└─ Return: complete course data
```

**Student Sees:**

-   Course title, description, thumbnail
-   What you'll learn (outcomes)
-   Course curriculum (sections/lessons)
-   Instructor bio and credentials
-   Student reviews and ratings
-   Price and discounts
-   Requirements and prerequisites

#### 1.3 Add to Cart

```mermaid
POST /api/wishlist-cart/cart
├─ Input: courseId
├─ Check if already enrolled
├─ Check if already in cart
├─ Add to user's cart
└─ Return: updated cart
```

**Code Flow:**

```javascript
POST /api/wishlist-cart/cart
  → wishlistCartController.addToCart()
  → Check Enrollment.exists({ user, course })
  → Check Cart.exists({ user, course })
  → Cart.create({ user, course })
  → Return cart items with course details
```

#### 1.4 Apply Coupon

```mermaid
POST /api/coupons/apply
├─ Input: coupon code
├─ Validate coupon (active, not expired)
├─ Check usage limit
├─ Check minimum purchase
├─ Calculate discount
└─ Return: discount amount
```

#### 1.5 Checkout & Payment

```mermaid
POST /api/orders
├─ Create order with cart items
├─ Apply coupon if any
├─ Calculate total amount
├─ Generate payment link (VietQR/SePay)
├─ Save order (status: pending)
└─ Return: order + payment link
```

**Payment Flow:**

```javascript
1. Student clicks "Checkout"
2. POST /api/orders → Create order
3. Generate QR code for payment
4. Student scans QR and pays
5. Webhook from payment gateway
6. POST /api/orders/:id/verify-payment
7. Update order status to 'completed'
8. Create enrollments for all courses
9. Clear cart
10. Send confirmation email
```

### 2. Learning Experience

#### 2.1 Access Enrolled Courses

```mermaid
GET /api/enrollments
├─ Get user's enrollments
├─ Include course data
├─ Show progress percentage
├─ Filter by status (active, completed)
└─ Return: enrolled courses with progress
```

**Student Dashboard Shows:**

-   Continue Learning (last accessed)
-   All Enrolled Courses
-   Progress percentage per course
-   Completion status
-   Certificates earned

#### 2.2 Study Plan Generation

```mermaid
POST /api/study-plans/generate
├─ Input: enrollmentId, hoursPerDay, daysPerWeek, targetDate
├─ Calculate course duration
├─ Generate daily sessions
├─ Assign lessons to each session
├─ Create study schedule
└─ Return: personalized study plan
```

**Code Logic:**

```javascript
generateStudyPlan({
  enrollmentId,
  hoursPerDay: 2,
  daysPerWeek: [1, 3, 5], // Mon, Wed, Fri
  targetDate: '2026-03-01'
}) {
  1. Get course curriculum
  2. Calculate total lessons
  3. Estimate total hours
  4. Divide into daily sessions
  5. Assign lessons to each day
  6. Create StudyPlan document
  7. Generate sessions array
  8. Return plan with dates
}
```

**Student Can:**

-   View today's session
-   Mark sessions as complete
-   Mark sessions as missed
-   Reschedule missed sessions
-   Update study preferences
-   Regenerate plan if needed

#### 2.3 Daily Study Session

```mermaid
GET /api/study-plans/:id/today
├─ Get today's session
├─ Show lessons to study
├─ Track time spent
└─ Return: today's lesson list
```

**Session Completion:**

```mermaid
PUT /api/study-plans/:id/sessions/:sessionId/complete
├─ Mark session completed
├─ Update progress
├─ Add XP points
├─ Check streak
├─ Unlock achievements
└─ Return: updated plan + rewards
```

#### 2.4 Course Progress Tracking

```mermaid
Lesson Completion Flow:
1. Student watches video lesson
2. Mark lesson as completed
3. Update enrollment progress
4. Update roadmap level progress
5. Add XP based on lesson
6. Update daily goals
7. Check if section completed
8. Unlock next level if criteria met
```

**Code Flow:**

```javascript
// Mark lesson complete
POST /api/enrollments/:id/progress
  → enrollmentController.updateProgress()
  → Find lesson in curriculum
  → Mark as completed
  → Calculate new progress %
  → Update enrollment.completedLessons[]
  → Update enrollment.progress
  → Add XP to user
  → Check level unlock requirements
  → Update UserProgress
  → Return new progress
```

### 3. Gamification & Roadmap

#### 3.1 XP & Level System

```mermaid
Student Actions → Earn XP:
├─ Complete lesson: +50 XP
├─ Complete section: +100 XP
├─ Complete course: +500 XP
├─ Pass quiz: +100 XP
├─ Daily streak: +20 XP/day
├─ Write review: +30 XP
└─ Help others (comments): +10 XP

XP → Level Up:
├─ Level 1: 0-100 XP
├─ Level 2: 100-300 XP
├─ Level 3: 300-600 XP
├─ Level progression formula
└─ Each level unlocks badges
```

**Code Flow:**

```javascript
POST /api/gamification/progress/add-xp
  → gamificationController.addXP()
  → UserProgress.findOne({ user })
  → progress.addXP(amount)
  → Check if level up
  → If level up:
      - Increment level
      - Award cups
      - Unlock achievement
      - Send notification
  → Save progress
  → Return new level + rewards
```

#### 3.2 Cups (Trophies) System

```javascript
Ways to Earn Cups:
- Complete first course: 1 cup
- Maintain 7-day streak: 1 cup
- Earn 1000 XP: 2 cups
- Complete 5 courses: 3 cups
- Get 5-star review: 1 cup
- Master a skill: 2 cups
```

#### 3.3 Achievement System

```mermaid
Achievements:
├─ First Steps: Complete first lesson
├─ Quick Learner: Complete course in < 7 days
├─ Consistent: 30-day streak
├─ Scholar: Earn 5000 XP
├─ Certified: Get 3 certificates
├─ Social: Write 10 reviews
└─ Master: Complete learning roadmap
```

**Unlock Achievement:**

```javascript
POST /api/gamification/progress/unlock-achievement
  → Check requirements met
  → Add achievement to user
  → Award XP bonus
  → Award cups
  → Send notification
  → Update leaderboard
```

#### 3.4 Daily Streaks

```javascript
Streak System:
- Study at least 1 session per day
- Streak counter increments
- Miss a day → streak resets
- Longest streak recorded
- Bonus XP for long streaks

POST /api/gamification/progress/update-streak
  → Check last study date
  → If today: maintain streak
  → If yesterday: increment streak
  → If gap > 1 day: reset to 1
  → Update UserProgress
  → Award bonus XP for milestones
```

#### 3.5 Learning Roadmap

```mermaid
Course Roadmap Structure:
Course
  └─ Level 1 (Beginner)
      ├─ Unlock: Auto unlocked
      ├─ Lessons: [1, 2, 3, 4, 5]
      └─ Requirements: None
  └─ Level 2 (Intermediate)
      ├─ Unlock: Complete Level 1 + 100 XP
      ├─ Lessons: [6, 7, 8, 9, 10]
      └─ Requirements: Level 1 completed
  └─ Level 3 (Advanced)
      ├─ Unlock: Complete Level 2 + 500 XP + 2 cups
      ├─ Lessons: [11, 12, 13, 14, 15]
      └─ Requirements: Level 2 completed
```

**Roadmap Flow:**

```javascript
// Check if can unlock level
GET /api/roadmap/progress/levels/:levelId/check-unlock
  → roadmapController.checkLevelUnlock()
  → Get level requirements
  → Check previous level completed
  → Check user XP >= required
  → Check user cups >= required
  → Return: canUnlock: true/false

// Unlock level
POST /api/roadmap/progress/levels/:levelId/unlock
  → Verify requirements
  → Create/Update UserRoadmapProgress
  → Set level as unlocked
  → Return success

// Update lesson progress
POST /api/roadmap/progress/levels/:levelId/lessons/:lessonId
  → Mark lesson completed
  → Update progress %
  → Check if level completed
  → Unlock next level if ready
```

### 4. Quizzes & Assessments

#### 4.1 Take Quiz

```mermaid
Quiz Flow:
1. Student clicks "Take Quiz"
   → GET /api/quizzes/:id
   → Return quiz questions (without answers)

2. Student answers questions
   → Frontend stores answers locally
   → Timer counts down

3. Submit quiz
   → POST /api/quizzes/:id/submit
   → Input: answers array
   → Calculate score
   → Create QuizAttempt
   → Return: score + correct answers

4. View results
   → Show score percentage
   → Show correct/wrong answers
   → Show explanations
   → Allow retake if allowed
```

**Code Flow:**

```javascript
POST /api/quizzes/:id/submit
  → quizController.submitQuiz()
  → Get quiz from DB
  → Loop through student answers
  → Compare with correct answers
  → Calculate score
  → Check if passed (>= passingScore)
  → Create QuizAttempt({
      quiz, user, enrollment,
      answers, score, isPassed
    })
  → If passed && first time:
      - Award XP
      - Update enrollment
      - Generate certificate if course completed
  → Return results
```

#### 4.2 Quiz Attempts History

```javascript
GET /api/quizzes/enrollments/:enrollmentId/attempts
  → Get all attempts for enrollment
  → Sort by date (newest first)
  → Show: score, isPassed, date
  → Allow view answers if completed
```

### 5. Certificates

#### 5.1 Certificate Generation

```mermaid
Certificate Eligibility:
├─ Complete all lessons ✓
├─ Pass all required quizzes ✓
├─ Meet minimum progress (100%) ✓
└─ Course status: completed

Auto-Generate:
POST /api/enrollments/:id/generate-certificate
├─ Check completion
├─ Generate certificate PDF
├─ Upload to Cloudinary
├─ Save certificate URL
├─ Update enrollment
└─ Send email notification
```

**Certificate Data:**

```javascript
{
  student: "Student Name",
  course: "Course Title",
  instructor: "Instructor Name",
  completionDate: "2026-01-06",
  certificateId: "LMS-2026-12345",
  hours: 40,
  grade: "A",
  certificateUrl: "https://cloudinary.../cert.pdf"
}
```

### 6. Reviews & Ratings

#### 6.1 Write Review

```mermaid
POST /api/reviews
├─ Input: courseId, rating (1-5), comment
├─ Check: student has enrollment
├─ Check: enrollment progress > 50%
├─ Create review
├─ Update course average rating
├─ Award XP to student
└─ Notify instructor
```

**Validation:**

```javascript
- Must be enrolled in course
- Progress >= 50%
- One review per course
- Rating: 1-5 stars
- Comment: min 20 characters
```

#### 6.2 Course Discussions

```javascript
// Post comment on lesson
POST /api/comments
  → Input: courseId, lessonId, content
  → Create comment
  → Notify instructor
  → Award 10 XP

// Reply to comment
POST /api/comments/:id/reply
  → Create reply
  → Notify parent comment author

// Like/helpful mark
POST /api/comments/:id/helpful
  → Mark as helpful
  → Award 5 XP to comment author
```

### 7. Real-time Chat Support

#### 7.1 Live Chat with Instructor

```javascript
// Connect to Socket.io
socket.emit('join_course', { courseId, userId });

// Send message
socket.emit('send_message', {
	courseId,
	userId,
	message: 'I have a question...',
});

// Receive messages
socket.on('new_message', (message) => {
	// Display in chat UI
});

// Instructor replies
socket.on('instructor_reply', (reply) => {
	// Show instructor response
});
```

### 8. Notifications

#### 8.1 Notification Types for Students

```javascript
Notification Events:
- Course updates from instructor
- New lesson added
- Quiz published
- Certificate ready
- Course completed
- Achievement unlocked
- Level up notification
- Streak milestone reached
- Instructor replied to comment
- Announcement from admin
- Study reminder (daily session)
```

**Fetch Notifications:**

```javascript
GET /api/notifications
  → Get unread notifications
  → Mark as read when opened
  → Delete old notifications
```

### 9. Student Dashboard Analytics

#### 9.1 Personal Dashboard

```mermaid
GET /api/analytics/student/dashboard
Returns:
├─ Enrolled Courses: 5
├─ Completed Courses: 2
├─ In Progress: 3
├─ Total Study Time: 45 hours
├─ Average Progress: 67%
├─ Current Streak: 12 days
├─ XP: 2,450
├─ Level: 8
├─ Cups: 15
├─ Achievements: [12 badges]
├─ Certificates: [2 certs]
└─ Upcoming Sessions: [today's plan]
```

**Statistics Shown:**

-   Learning progress chart
-   Study time per week
-   XP growth over time
-   Courses completion rate
-   Quiz scores average
-   Leaderboard position

### 10. Wishlist & Saved Courses

```javascript
// Add to wishlist
POST /api/wishlist-cart/wishlist
  → Save course for later
  → Get price alerts
  → Notify when discount

// Move to cart
POST /api/wishlist-cart/wishlist/:courseId/move-to-cart
  → Remove from wishlist
  → Add to cart
```

---

## 👨‍🏫 Instructor Role Flow

### 1. Instructor Onboarding

#### 1.1 Apply as Instructor

```mermaid
POST /api/auth/apply-instructor
├─ Student submits application
├─ Upload: bio, credentials, portfolio
├─ Admin reviews application
├─ Approval/Rejection
└─ Role updated to 'instructor'
```

### 2. Course Creation

#### 2.1 Create New Course

```mermaid
POST /api/courses
├─ Input: title, description, category, level
├─ Set price, thumbnail
├─ Define learning outcomes
├─ Set requirements
├─ Status: draft (not published yet)
└─ Return: courseId
```

**Course Structure:**

```javascript
Course {
  title: "React Mastery",
  description: "Complete React course...",
  instructor: instructorId,
  category: categoryId,
  level: levelId,
  price: 499000,
  originalPrice: 999000,
  thumbnail: "url",
  outcomes: ["Build React apps", "Master hooks"],
  requirements: ["Basic JavaScript"],
  curriculum: [],
  status: 'draft',
  isPublished: false
}
```

#### 2.2 Build Curriculum

```mermaid
Add Sections & Lessons:
1. Create Section
   → POST /api/courses/:id/sections
   → Input: title, order

2. Add Lessons to Section
   → POST /api/courses/:id/sections/:sectionId/lessons
   → Input: title, type, duration, content
   → Types: video, article, quiz, assignment

3. Upload Video
   → POST /api/upload/video
   → Upload to Cloudinary
   → Get video URL
   → Save to lesson

4. Reorder Curriculum
   → PUT /api/courses/:id/curriculum/reorder
   → Update lesson order
```

**Curriculum Structure:**

```javascript
curriculum: [
  {
    sectionId: "1",
    title: "Introduction",
    order: 1,
    lessons: [
      {
        lessonId: "1.1",
        title: "What is React?",
        type: "video",
        duration: 15,
        videoUrl: "...",
        order: 1,
        isFree: true // Preview lesson
      },
      {
        lessonId: "1.2",
        title: "Setup Environment",
        type: "article",
        content: "...",
        order: 2,
        isFree: false
      }
    ]
  },
  {
    sectionId: "2",
    title: "React Basics",
    order: 2,
    lessons: [...]
  }
]
```

#### 2.3 Create Learning Roadmap

```mermaid
POST /api/roadmap/levels
├─ Define levels (Beginner, Intermediate, Advanced)
├─ Assign lessons to each level
├─ Set unlock requirements
├─ Define XP/cups needed
└─ Create roadmap visualization
```

**Roadmap Configuration:**

```javascript
RoadmapLevel {
  course: courseId,
  levelNumber: 1,
  title: "React Fundamentals",
  description: "Master the basics",
  lessons: ["1.1", "1.2", "1.3"],
  unlockRequirements: {
    previousLevel: null,
    minXP: 0,
    minCups: 0
  },
  position: { x: 0, y: 0 },
  icon: "🎯",
  rewards: {
    xp: 100,
    cups: 1,
    badge: "React Beginner"
  }
}
```

#### 2.4 Create Quizzes

```mermaid
POST /api/quizzes
├─ Input: course, title, questions
├─ Question types:
│   ├─ Multiple choice
│   ├─ True/False
│   ├─ Multiple answers
│   └─ Fill in the blank
├─ Set passing score
├─ Set time limit
├─ Assign to section
└─ Return: quizId
```

**Quiz Structure:**

```javascript
Quiz {
  course: courseId,
  title: "React Hooks Quiz",
  description: "Test your knowledge",
  timeLimit: 30, // minutes
  passingScore: 70, // percentage
  maxAttempts: 3,
  questions: [
    {
      question: "What is useState?",
      type: "multiple_choice",
      options: [
        "A hook for state management",
        "A component",
        "A method",
        "None"
      ],
      correctAnswer: 0,
      explanation: "useState is a React hook...",
      points: 10
    }
  ]
}
```

### 3. Course Approval Workflow

#### 3.1 Submit for Review

```mermaid
POST /api/course-approvals/submit
├─ Check: curriculum completed
├─ Check: min 5 lessons
├─ Check: all videos uploaded
├─ Check: quizzes created
├─ Create CourseApproval
├─ Status: pending
├─ Notify admin/reviewer
└─ Return: submission ID
```

**Submission Checklist:**

```javascript
✓ Course title and description
✓ Thumbnail image
✓ At least 5 lessons
✓ All videos uploaded
✓ Learning outcomes defined
✓ Prerequisites listed
✓ Pricing set
✓ Quizzes created (optional)
✓ Roadmap configured
```

#### 3.2 Track Approval Status

```javascript
GET /api/course-approvals/my-submissions
  → Get all instructor's submissions
  → Status: pending, approved, rejected, revision_requested
  → Show reviewer feedback
  → Show checklist items
```

#### 3.3 Handle Feedback

```mermaid
Approval Process:
1. Reviewer checks course
   → POST /api/course-approvals/:id/feedback
   → Add comments on improvements

2. Instructor receives feedback
   → GET /api/course-approvals/:id
   → View checklist items
   → See reviewer comments

3. Instructor makes revisions
   → Update course content
   → POST /api/course-approvals/:id/resubmit

4. Final approval
   → POST /api/course-approvals/:id/approve
   → Course published automatically
   → Status: approved
   → isPublished: true
```

### 4. Course Management

#### 4.1 Update Course

```javascript
PUT /api/courses/:id
  → Update course information
  → Update pricing
  → Update curriculum
  → Notify enrolled students of changes
  → Create new version if major update
```

#### 4.2 Course Versioning

```mermaid
Major Update:
├─ Save current as version 1.0
├─ Create new version 2.0
├─ Existing students keep 1.0
├─ New students get 2.0
└─ Option to upgrade (free/paid)

POST /api/courses/:id/create-version
  → Create CourseVersion
  → Duplicate curriculum
  → Update version number
  → Notify students
```

#### 4.3 Publish/Unpublish Course

```javascript
// Publish course
PUT /api/courses/:id/publish
  → Set isPublished: true
  → Notify followers
  → Index in search

// Unpublish (maintenance)
PUT /api/courses/:id/unpublish
  → Set isPublished: false
  → Enrolled students can still access
  → New enrollments blocked
```

### 5. Student Management

#### 5.1 View Enrolled Students

```javascript
GET /api/courses/:courseId/students
  → Get all enrollments
  → Show student progress
  → Show completion rate
  → Filter by progress range
  → Sort by enrollment date
```

**Student Data Shown:**

```javascript
{
  studentName: "John Doe",
  email: "john@example.com",
  enrolledAt: "2026-01-01",
  progress: 65,
  lastAccessed: "2026-01-06",
  completedLessons: 15,
  totalLessons: 23,
  quizScores: [85, 90, 78],
  certificateIssued: false
}
```

#### 5.2 Message Students

```javascript
// Send announcement to all students
POST /api/courses/:courseId/announce
  → Input: message, title
  → Create notification for all enrolled
  → Send email (optional)
  → Show in student dashboard

// Reply to student question
POST /api/comments/:id/reply
  → Reply to course discussion
  → Notify student
  → Mark as instructor answer
```

#### 5.3 Course Analytics

```javascript
GET /api/analytics/courses/:courseId
  → Total enrollments
  → Active students (last 7 days)
  → Completion rate
  → Average progress
  → Average quiz scores
  → Most challenging lessons
  → Student feedback summary
  → Revenue generated
```

**Analytics Dashboard:**

```javascript
{
  totalEnrollments: 245,
  activeStudents: 180,
  completionRate: 42, // percentage
  avgProgress: 67,
  avgRating: 4.6,
  totalRevenue: 122550000, // VND
  chartData: {
    enrollmentsOverTime: [...],
    progressDistribution: [...],
    lessonCompletionRate: [...]
  }
}
```

### 6. Q&A and Support

#### 6.1 Answer Student Questions

```javascript
GET /api/comments?courseId=...&unanswered=true
  → Get unanswered questions
  → Sort by date or upvotes
  → Filter by lesson

POST /api/comments/:id/reply
  → Answer student question
  → Mark as instructor answer
  → Pin answer if important
  → Award helpful badge if many upvotes
```

#### 6.2 Live Chat Sessions

```javascript
// Start live Q&A session
POST /api/courses/:courseId/live-session
  → Create live chat room
  → Notify enrolled students
  → Enable real-time chat
  → Record session (optional)

// Socket.io real-time
socket.emit('instructor_online', { courseId });
socket.on('student_question', (question) => {
  // Answer in real-time
});
```

### 7. Content Creation Tools

#### 7.1 Upload Video

```javascript
POST /api/upload/video
  → Upload to Cloudinary/AWS
  → Process video (compression)
  → Generate thumbnails
  → Extract duration
  → Return video URL
```

#### 7.2 Upload Resources

```javascript
POST /api/upload/resources
  → Upload: PDF, ZIP, images
  → Attach to lesson
  → Students can download
  → Track download count
```

#### 7.3 Create Assignments

```javascript
POST /api/assignments
  → Create assignment
  → Set deadline
  → Define submission format
  → Students submit work
  → Instructor reviews & grades
```

### 8. Instructor Dashboard

#### 8.1 Overview Metrics

```javascript
GET /api/analytics/instructor/dashboard
Returns:
├─ Total Students: 245
├─ Total Courses: 8
├─ Published: 6
├─ In Review: 2
├─ Total Earnings: 122,550,000 VND
├─ This Month: 15,300,000 VND
├─ Average Rating: 4.6/5
├─ Total Reviews: 189
├─ Active Students (7 days): 156
└─ Pending Questions: 12
```

#### 8.2 Revenue Tracking

```javascript
GET /api/orders?instructorId=...
  → Get all orders for instructor courses
  → Calculate earnings (after platform fee)
  → Show revenue by course
  → Monthly revenue chart
  → Pending payouts
  → Payment history
```

**Revenue Split:**

```javascript
Course Price: 499,000 VND
Platform Fee (20%): -99,800 VND
Instructor Earnings: 399,200 VND
```

### 9. Course Promotion

#### 9.1 Create Coupons

```javascript
POST /api/coupons
  → Input: code, discount, expiry
  → Types: percentage, fixed amount
  → Usage limit
  → Min purchase requirement
  → Applicable to instructor's courses only

Coupon Example:
{
  code: "REACT50",
  discountType: "percentage",
  discountValue: 50,
  validFrom: "2026-01-01",
  validUntil: "2026-01-31",
  usageLimit: 100,
  minimumPurchase: 0,
  applicableCourses: [courseId1, courseId2]
}
```

#### 9.2 Run Promotions

```javascript
// Flash sale
PUT /api/courses/:id/promotion
  → Set discounted price
  → Set promotion period
  → Create announcement
  → Notify wishlist users
```

---

## 👨‍💼 Admin Role Flow

### 1. System Overview

#### 1.1 Admin Dashboard

```javascript
GET /api/analytics/admin/dashboard
Returns:
├─ Total Users: 12,450
│   ├─ Students: 11,200
│   ├─ Instructors: 1,200
│   └─ Admins: 50
├─ Total Courses: 1,250
│   ├─ Published: 980
│   ├─ Pending Review: 45
│   └─ Draft: 225
├─ Total Revenue: 5,678,900,000 VND
│   ├─ This Month: 456,700,000 VND
│   ├─ Platform Fee: 1,135,780,000 VND
│   └─ Instructor Payouts: 4,543,120,000 VND
├─ Total Enrollments: 45,600
├─ Active Users (30 days): 8,900
├─ New Users (7 days): 234
└─ System Health: All systems operational
```

### 2. User Management

#### 2.1 View All Users

```javascript
GET /api/admin/users
  → Pagination support
  → Filter by role, status
  → Search by name, email
  → Sort by registration date
  → Export to CSV

Returns:
[{
  userId,
  name,
  email,
  role,
  isActive,
  isBlocked,
  enrollments: 5,
  coursesCreated: 2,
  totalSpent: 1500000,
  registeredAt,
  lastLogin
}]
```

#### 2.2 Manage User Status

```javascript
// Block user
POST /api/admin/users/:id/block
  → Input: reason, duration
  → Set isBlocked: true
  → Revoke access tokens
  → Send email notification
  → Log in audit trail

// Unblock user
POST /api/admin/users/:id/unblock
  → Restore access
  → Notify user

// Delete user (GDPR)
DELETE /api/admin/users/:id
  → Anonymize personal data
  → Keep enrollment records
  → Remove from leaderboards
```

#### 2.3 Role Management

```javascript
// Promote to instructor
POST /api/admin/users/:id/promote-instructor
  → Verify credentials
  → Change role to 'instructor'
  → Grant course creation permissions
  → Send welcome email

// Make admin
POST /api/admin/users/:id/make-admin
  → Change role to 'admin'
  → Grant all permissions
  → Require 2FA
```

### 3. Course Review & Approval

#### 3.1 Review Pending Courses

```javascript
GET /api/course-approvals?status=pending
  → Get all pending submissions
  → Sort by submission date
  → Show instructor details
  → Preview course content
```

#### 3.2 Course Quality Check

```mermaid
Checklist:
✓ Content Quality
  ├─ Grammar and spelling
  ├─ Video quality (HD)
  ├─ Audio clarity
  └─ Professional presentation

✓ Course Structure
  ├─ Logical flow
  ├─ Proper curriculum
  ├─ Adequate content length
  └─ Learning outcomes clear

✓ Technical Requirements
  ├─ All videos uploaded
  ├─ Resources available
  ├─ Quizzes functional
  └─ No broken links

✓ Compliance
  ├─ No copyrighted content
  ├─ Appropriate content
  ├─ Terms of service compliance
  └─ Pricing reasonable
```

#### 3.3 Provide Feedback

```javascript
POST /api/course-approvals/:id/feedback
  → Select checklist items
  → Add detailed comments
  → Category: content, technical, compliance
  → Suggest improvements
  → Notify instructor
```

#### 3.4 Approve or Reject

```javascript
// Approve course
POST /api/course-approvals/:id/approve
  → Review checklist completed
  → Set status: approved
  → Publish course automatically
  → Create success notification
  → Update instructor stats

// Reject course
POST /api/course-approvals/:id/reject
  → Input: rejection reason
  → Set status: rejected
  → Cannot resubmit
  → Refund review fee (if any)

// Request revision
POST /api/course-approvals/:id/request-revision
  → Provide detailed feedback
  → Set status: revision_requested
  → Instructor can fix and resubmit
```

### 4. Platform Content Management

#### 4.1 Manage Categories

```javascript
// CRUD operations
GET /api/categories → List all
POST /api/categories → Create new
PUT /api/categories/:id → Update
DELETE /api/categories/:id → Delete (if no courses)

Category Structure:
{
  name: "Web Development",
  slug: "web-development",
  description: "Learn web technologies",
  icon: "💻",
  order: 1,
  isActive: true,
  courseCount: 245
}
```

#### 4.2 Manage Levels

```javascript
POST /api/levels
  → Create: Beginner, Intermediate, Advanced, Expert
  → Define criteria for each
  → Assign to courses
```

#### 4.3 CMS Page Management

```javascript
// Manage static pages
GET /api/cms/pages
POST /api/cms/pages → Create (About, FAQ, Policy)
PUT /api/cms/pages/:id → Update content
PUT /api/cms/pages/:id/publish → Publish
DELETE /api/cms/pages/:id → Delete

Page Types:
- About Us
- FAQ
- Privacy Policy
- Terms of Service
- Contact
- Help Center
- Blog Posts
```

#### 4.4 Create Announcements

```javascript
POST /api/announcements
  → Input: title, content, type, priority
  → Target audience: all, students, instructors
  → Set start/end date
  → Optional: dismissible
  → Send email notification
  → Show on dashboard

Announcement Types:
- info: Platform updates
- warning: Scheduled maintenance
- success: New features
- error: Critical issues
```

### 5. Revenue & Financial Management

#### 5.1 Revenue Dashboard

```javascript
GET /api/analytics/admin/revenue
Returns:
├─ Total Revenue: 5,678,900,000 VND
├─ Platform Revenue (20%): 1,135,780,000 VND
├─ Instructor Payouts: 4,543,120,000 VND
├─ Revenue by Month: [chart data]
├─ Revenue by Category: [chart data]
├─ Top Earning Courses: [list]
└─ Pending Payouts: 45,600,000 VND
```

#### 5.2 Manage Orders

```javascript
GET /api/orders?status=...
  → View all orders
  → Filter: completed, pending, refunded
  → Search by order ID, user
  → Export to Excel

Order Details:
{
  orderId,
  user,
  courses: [{courseId, price}],
  totalAmount,
  couponApplied,
  discountAmount,
  finalAmount,
  paymentMethod,
  paymentStatus,
  transactionId,
  orderDate
}
```

#### 5.3 Process Refunds

```javascript
POST /api/orders/:id/refund
  → Input: refund reason
  → Check refund policy (30 days)
  → Process payment reversal
  → Revoke course access
  → Update order status
  → Notify user and instructor
  → Log in audit trail
```

#### 5.4 Instructor Payouts

```javascript
GET /api/admin/payouts
  → Calculate pending payouts
  → Group by instructor
  → Export payout report
  → Mark as paid after bank transfer

Process Payout:
POST /api/admin/payouts/:instructorId/process
  → Calculate earnings
  → Deduct platform fee
  → Generate invoice
  → Mark as paid
  → Send payment confirmation
```

### 6. Achievement & Gamification Management

#### 6.1 Create Achievements

```javascript
POST /api/gamification/achievements
  → Define achievement
  → Set unlock requirements
  → Set rewards (XP, cups, badge)
  → Upload badge icon
  → Set visibility

Achievement Example:
{
  title: "Course Completer",
  description: "Complete your first course",
  icon: "🎓",
  requirements: {
    type: "course_completion",
    count: 1
  },
  rewards: {
    xp: 100,
    cups: 1,
    badgeUrl: "..."
  },
  isActive: true
}
```

#### 6.2 Configure XP System

```javascript
PUT /api/admin/gamification/settings
  → Set XP values for actions
  → Configure level progression
  → Set cup rewards
  → Configure leaderboard rules

Settings:
{
  lessonComplete: 50,
  sectionComplete: 100,
  courseComplete: 500,
  quizPass: 100,
  dailyStreak: 20,
  reviewWrite: 30,
  levelUpFormula: "100 * (level ** 1.5)"
}
```

### 7. Coupon Management

#### 7.1 Create Platform Coupons

```javascript
POST /api/coupons
  → Platform-wide coupons
  → Select applicable courses
  → Set discount and limits
  → Schedule activation
  → Track usage

Coupon Types:
- Welcome Bonus: 20% off first course
- Flash Sale: 50% off selected courses
- Seasonal: Holiday discounts
- Referral: Discount for referred users
```

#### 7.2 Monitor Coupon Usage

```javascript
GET /api/coupons/:id/usage
  → Total redemptions
  → Revenue impact
  → User acquisition cost
  → ROI calculation
```

### 8. Analytics & Reporting

#### 8.1 User Analytics

```javascript
GET /api/analytics/users
  → User growth over time
  → Active users (DAU, MAU)
  → User retention rate
  → Churn rate
  → User demographics
  → Device/browser stats
```

#### 8.2 Course Analytics

```javascript
GET /api/analytics/courses
  → Most popular courses
  → Highest rated courses
  → Course completion rates
  → Average progress per course
  → Most challenging lessons
  → Student feedback summary
```

#### 8.3 Revenue Analytics

```javascript
GET /api/analytics/revenue
  → Revenue trends
  → Revenue by category
  → Revenue by instructor
  → Conversion rate
  → Average order value
  → Refund rate
```

#### 8.4 Export Reports

```javascript
GET /api/analytics/export
  → Choose report type
  → Select date range
  → Select format (CSV, Excel, PDF)
  → Download report

Report Types:
- User registrations
- Course enrollments
- Revenue summary
- Instructor earnings
- Refund report
- Usage statistics
```

### 9. Chatbot Management

#### 9.1 Monitor Conversations

```javascript
GET /api/chatbot/conversations
  → View all chatbot chats
  → Filter by status
  → See conversation history
  → Identify common questions
```

#### 9.2 Chatbot Analytics

```javascript
GET /api/chatbot/analytics
  → Total conversations
  → Leads captured
  → Transfer to agent rate
  → Average response time
  → Common queries
  → Satisfaction rate
```

#### 9.3 Transfer to Human Agent

```javascript
// When chatbot can't answer
POST /api/chatbot/conversations/:id/transfer
  → Assign to support agent
  → Agent takes over chat
  → Continue conversation
  → Resolve issue
  → Close conversation
```

### 10. Audit & Compliance

#### 10.1 Audit Logs

```javascript
GET /api/audit-logs
  → View all system activities
  → Filter by:
      - Action type (create, update, delete)
      - Resource (user, course, order)
      - User who performed action
      - Date range
  → Track changes history
  → Export for compliance

Log Entry:
{
  action: "update",
  resourceType: "Course",
  resourceId: "...",
  userId: "...",
  userName: "Admin Name",
  changes: {
    before: { price: 499000 },
    after: { price: 399000 }
  },
  ipAddress: "192.168.1.1",
  userAgent: "...",
  timestamp: "2026-01-06T10:30:00Z"
}
```

#### 10.2 Security Monitoring

```javascript
// Failed login attempts
GET /api/admin/security/failed-logins
  → Monitor suspicious activity
  → Block IPs if needed

// Active sessions
GET /api/admin/security/sessions
  → View all active sessions
  → Force logout users if needed
```

### 11. System Configuration

#### 11.1 Platform Settings

```javascript
PUT /api/admin/settings
  → Site name, logo
  → Email settings
  → Payment gateway config
  → Platform fee percentage
  → Refund policy
  → Terms & conditions
  → Privacy policy
```

#### 11.2 Email Templates

```javascript
GET /api/admin/email-templates
  → Manage email templates
  → Welcome email
  → Course enrollment
  → Certificate issued
  → Password reset
  → Promotional emails
```

---

## 👨‍⚖️ Reviewer Role Flow

### 1. Course Review Queue

```javascript
GET /api/course-approvals?status=pending
  → Get assigned courses for review
  → Priority by submission date
  → Filter by category
```

### 2. Review Process

#### 2.1 Detailed Review

```mermaid
Review Checklist:
1. Content Quality (40 points)
   ✓ Grammar and clarity
   ✓ Depth of content
   ✓ Accuracy of information
   ✓ Practical examples

2. Production Quality (30 points)
   ✓ Video quality
   ✓ Audio quality
   ✓ Editing proficiency
   ✓ Visual aids

3. Course Structure (20 points)
   ✓ Logical progression
   ✓ Curriculum completeness
   ✓ Learning outcomes clear
   ✓ Appropriate duration

4. Student Experience (10 points)
   ✓ Engagement elements
   ✓ Assessments quality
   ✓ Resources provided
   ✓ Support materials

Total Score: /100
Pass: >= 70
```

#### 2.2 Provide Feedback

```javascript
POST /api/course-approvals/:id/feedback
  → Category-wise comments
  → Strengths and weaknesses
  → Improvement suggestions
  → Rating score
```

#### 2.3 Decision

```javascript
// Approve
POST /api/course-approvals/:id/approve
  → Score >= 70
  → All checklist items passed
  → Ready for publishing

// Request Revision
POST /api/course-approvals/:id/request-revision
  → Score 50-69
  → Fixable issues
  → Detailed feedback provided

// Reject
POST /api/course-approvals/:id/reject
  → Score < 50
  → Major issues
  → Cannot be fixed easily
```

---

## 🔄 Common Features (All Roles)

### 1. Profile Management

```javascript
// View profile
GET /api/users/profile
  → Get current user data
  → Avatar, bio, credentials
  → Stats and achievements

// Update profile
PUT /api/users/profile
  → Update: name, bio, avatar
  → Change email (verify)
  → Update credentials

// Change password
POST /api/auth/change-password
  → Input: old password, new password
  → Verify old password
  → Hash new password
  → Update in DB
  → Invalidate old tokens
```

### 2. Notifications

```javascript
GET /api/notifications
  → Get all notifications
  → Filter: unread, read
  → Pagination

PUT /api/notifications/:id/read
  → Mark as read

DELETE /api/notifications/:id
  → Delete notification
```

### 3. Search

```javascript
GET /api/courses/search?q=react
  → Full-text search
  → Search in: title, description, instructor
  → Filter by: category, level, price
  → Sort by: relevance, rating, price
```

### 4. File Upload

```javascript
POST /api/upload
  → Upload: images, videos, documents
  → Validate: file type, size
  → Upload to Cloudinary/S3
  → Return: file URL
```

---

## 📊 Data Flow Examples

### Example 1: Student Enrolls in Course

```mermaid
Sequence:
1. Student → Browse Courses
2. Student → View Course Details
3. Student → Add to Cart
4. Student → Apply Coupon (optional)
5. Student → Checkout
6. System → Create Order (status: pending)
7. System → Generate Payment QR
8. Student → Scan & Pay
9. Payment Gateway → Webhook to System
10. System → Verify Payment
11. System → Update Order (status: completed)
12. System → Create Enrollment
13. System → Send Confirmation Email
14. System → Clear Cart
15. Student → Access Course
16. System → Suggest Study Plan
17. Student → Generate Study Plan
18. System → Create StudyPlan with sessions
19. Student → Start Learning
```

### Example 2: Instructor Creates & Publishes Course

```mermaid
Sequence:
1. Instructor → Create Course (draft)
2. Instructor → Upload Thumbnail
3. Instructor → Add Sections
4. Instructor → Upload Videos
5. Instructor → Create Quizzes
6. Instructor → Define Roadmap
7. Instructor → Preview Course
8. Instructor → Submit for Review
9. System → Create CourseApproval
10. System → Notify Reviewer
11. Reviewer → Review Course
12. Reviewer → Add Feedback
13. Reviewer → Approve Course
14. System → Update Course (published)
15. System → Notify Instructor
16. System → Index in Search
17. System → Show in Catalog
18. Students → Can Enroll
```

### Example 3: Student Completes Lesson & Earns XP

```mermaid
Sequence:
1. Student → Watch Lesson Video
2. Student → Mark as Complete
3. System → Update Enrollment Progress
4. System → Check if new section unlocked
5. System → Add XP (+50)
6. System → Check User Level
7. System → Level Up? Award Cups
8. System → Check Achievement Requirements
9. System → Unlock Achievement? Award Badge
10. System → Update Roadmap Progress
11. System → Check if Level Unlocked
12. System → Update Study Plan
13. System → Mark Session Complete
14. System → Update Streak
15. System → Update Leaderboard
16. System → Create Notification
17. Student → See Rewards
```

---

## 🎯 Key System Patterns

### 1. Authentication Pattern

```javascript
Every Protected Route:
Request → authenticate middleware → verify JWT → load user → check permissions → proceed

Authorization Levels:
- Public: Anyone
- Authenticated: Logged in users
- Student: Enrolled students only
- Instructor: Course creator only
- Admin: Platform admin only
- Reviewer: Course reviewer only
```

### 2. Data Pagination

```javascript
Standard Format:
GET /api/resource?page=1&limit=10
Response: {
  data: [...],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10
  }
}
```

### 3. Error Handling

```javascript
Try-Catch Pattern:
try {
  // Business logic
} catch (error) {
  logger.error(error);
  return res.status(500).json({
    success: false,
    message: error.message,
    errors: validation errors (if any)
  });
}
```

### 4. Audit Logging

```javascript
Every Important Action:
Before → Log initial state
Perform → Make changes
After → Log new state
Save → AuditLog entry

Used for:
- Compliance
- Debugging
- User activity tracking
- Security monitoring
```

---

## 📱 Real-time Features

### Socket.io Events

```javascript
// Student joins course chat
socket.emit('join_course', { courseId, userId });

// Instructor sends announcement
socket.emit('course_announcement', { courseId, message });

// Live quiz session
socket.emit('quiz_start', { quizId });
socket.on('submit_answer', (answer) => { ... });
socket.emit('quiz_results', { score });

// Progress updates
socket.emit('lesson_completed', { lessonId });
socket.emit('level_up', { newLevel, rewards });

// Notifications
socket.emit('new_notification', { notification });
```

---

## 🚀 Performance Optimizations

### 1. Database Indexes

```javascript
Course: {
	instructor, category, isPublished;
}
Enrollment: {
	user, course, status;
}
StudyPlan: {
	user, enrollment;
}
UserProgress: {
	user;
}
Order: {
	user, status, createdAt;
}
```

### 2. Caching Strategy

```javascript
Redis Cache:
- User sessions (JWT)
- Popular courses
- Leaderboard data
- Analytics data
- Course catalog

TTL:
- Sessions: 7 days
- Courses: 1 hour
- Analytics: 15 minutes
```

### 3. Lazy Loading

```javascript
Course Curriculum:
- Load sections on demand
- Stream videos (not download)
- Paginate long lists
- Infinite scroll
```

---

This documentation provides a complete flow of the LMS system for all roles. Each section details the API endpoints, data flow, business logic, and user experience from registration to course completion and beyond.
