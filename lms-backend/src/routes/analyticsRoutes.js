import express from 'express';
import {
	getAdminDashboard,
	getInstructorDashboard,
	getStudentDashboard,
	getCourseAnalytics,
	exportAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/analytics/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7days, 30days, 90days, 1year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                     totalCourses:
 *                       type: number
 *                     totalEnrollments:
 *                       type: number
 *                     revenueGrowth:
 *                       type: number
 *                     userGrowth:
 *                       type: number
 */
router.get('/admin/dashboard', authorize('admin'), getAdminDashboard);

/**
 * @swagger
 * /api/analytics/instructor/dashboard:
 *   get:
 *     summary: Get instructor dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEarnings:
 *                       type: number
 *                     totalStudents:
 *                       type: number
 *                     totalCourses:
 *                       type: number
 *                     averageRating:
 *                       type: number
 */
router.get('/instructor/dashboard', authorize('instructor', 'admin'), getInstructorDashboard);

/**
 * @swagger
 * /api/analytics/student/dashboard:
 *   get:
 *     summary: Get student dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrolledCourses:
 *                       type: number
 *                     completedCourses:
 *                       type: number
 *                     inProgressCourses:
 *                       type: number
 *                     totalStudyTime:
 *                       type: number
 *                     averageProgress:
 *                       type: number
 *                     currentStreak:
 *                       type: number
 *                     xp:
 *                       type: number
 *                     level:
 *                       type: number
 */
router.get('/student/dashboard', getStudentDashboard);

/**
 * @swagger
 * /api/analytics/courses/{courseId}:
 *   get:
 *     summary: Get course analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEnrollments:
 *                       type: number
 *                     activeStudents:
 *                       type: number
 *                     completionRate:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 */
router.get('/courses/:courseId', getCourseAnalytics);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: Export analytics data (CSV/Excel)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, courses, enrollments, revenue]
 *         required: true
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         default: csv
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', authorize('admin'), exportAnalytics);

export default router;
