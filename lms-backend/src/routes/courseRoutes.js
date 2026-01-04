import express from 'express';
import {
	getCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
} from '../controllers/courseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
	createCourseValidation,
	updateCourseValidation,
	getCourseByIdValidation,
	getCoursesValidation,
} from '../validators/courseValidator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

// Public routes
router.get('/', getCoursesValidation, validate, getCourses);
router.get('/:id', getCourseByIdValidation, validate, getCourseById);

// Protected routes - Instructor/Admin only
router.post('/', authenticate, authorize('instructor', 'admin'), createCourseValidation, validate, createCourse);

router.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourseValidation, validate, updateCourse);

router.delete('/:id', authenticate, authorize('instructor', 'admin'), getCourseByIdValidation, validate, deleteCourse);

export default router;
