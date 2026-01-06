import express from 'express';
import {
	submitForApproval,
	getCourseApprovals,
	getMySubmissions,
	getCourseApprovalById,
	addFeedback,
	approveCourse,
	rejectCourse,
	requestRevision,
	updateChecklist,
} from '../controllers/courseApprovalController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/course-approvals/submit:
 *   post:
 *     summary: Submit a course for approval
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID to submit for approval
 *     responses:
 *       201:
 *         description: Course submitted for approval successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CourseApproval'
 */
router.post('/submit', authorize('instructor', 'admin'), submitForApproval);

/**
 * @swagger
 * /api/course-approvals/my-submissions:
 *   get:
 *     summary: Get instructor's course submissions
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 */
router.get('/my-submissions', authorize('instructor', 'admin'), getMySubmissions);

/**
 * @swagger
 * /api/course-approvals:
 *   get:
 *     summary: Get all course approvals (Admin/Reviewer)
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revision_requested]
 *     responses:
 *       200:
 *         description: Approvals retrieved successfully
 */
router.get('/', authorize('admin', 'reviewer'), getCourseApprovals);

/**
 * @swagger
 * /api/course-approvals/{id}:
 *   get:
 *     summary: Get course approval by ID
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approval retrieved successfully
 */
router.get('/:id', getCourseApprovalById);

/**
 * @swagger
 * /api/course-approvals/{id}/feedback:
 *   post:
 *     summary: Add feedback to course approval
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [content, quality, technical, general]
 *     responses:
 *       200:
 *         description: Feedback added successfully
 */
router.post('/:id/feedback', authorize('admin', 'reviewer'), addFeedback);

/**
 * @swagger
 * /api/course-approvals/{id}/approve:
 *   post:
 *     summary: Approve a course
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course approved successfully
 */
router.post('/:id/approve', authorize('admin', 'reviewer'), approveCourse);

/**
 * @swagger
 * /api/course-approvals/{id}/reject:
 *   post:
 *     summary: Reject a course
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course rejected successfully
 */
router.post('/:id/reject', authorize('admin', 'reviewer'), rejectCourse);

/**
 * @swagger
 * /api/course-approvals/{id}/request-revision:
 *   post:
 *     summary: Request revision for a course
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revision requested successfully
 */
router.post('/:id/request-revision', authorize('admin', 'reviewer'), requestRevision);

/**
 * @swagger
 * /api/course-approvals/{id}/checklist:
 *   put:
 *     summary: Update approval checklist
 *     tags: [Course Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checklist:
 *                 type: object
 *     responses:
 *       200:
 *         description: Checklist updated successfully
 */
router.put('/:id/checklist', authorize('admin', 'reviewer'), updateChecklist);

export default router;
