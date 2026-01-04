import express from 'express';
import {
	enrollCourse,
	getMyEnrollments,
	getCourseProgress,
	updateProgress,
	generateCertificate,
	addNote,
} from '../controllers/enrollmentController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { body, param } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment and progress tracking
 */

// Enroll in a course
router.post('/', [body('courseId').isMongoId().withMessage('Invalid course ID')], validate, enrollCourse);

// Get my enrolled courses
router.get('/my-courses', getMyEnrollments);

// Get course progress
router.get(
	'/:courseId/progress',
	[param('courseId').isMongoId().withMessage('Invalid course ID')],
	validate,
	getCourseProgress
);

// Update lesson progress
router.put(
	'/:courseId/progress',
	[
		param('courseId').isMongoId().withMessage('Invalid course ID'),
		body('lessonId').isMongoId().withMessage('Invalid lesson ID'),
		body('completed').optional().isBoolean(),
		body('watchTime').optional().isNumeric(),
	],
	validate,
	updateProgress
);

// Generate certificate
router.post(
	'/:courseId/certificate',
	[param('courseId').isMongoId().withMessage('Invalid course ID')],
	validate,
	generateCertificate
);

// Add note
router.post(
	'/:courseId/notes',
	[
		param('courseId').isMongoId().withMessage('Invalid course ID'),
		body('lessonId').isMongoId().withMessage('Invalid lesson ID'),
		body('content').notEmpty().withMessage('Note content is required'),
		body('timestamp').optional().isNumeric(),
	],
	validate,
	addNote
);

export default router;
