import { body, param, query } from 'express-validator';

export const createCourseValidation = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Title is required')
		.isLength({ max: 200 })
		.withMessage('Title cannot exceed 200 characters'),

	body('description')
		.trim()
		.notEmpty()
		.withMessage('Description is required')
		.isLength({ max: 2000 })
		.withMessage('Description cannot exceed 2000 characters'),

	body('categoryId').notEmpty().withMessage('Category is required'),

	body('levelId').optional().isMongoId().withMessage('Invalid level ID'),

	body('price')
		.notEmpty()
		.withMessage('Price is required')
		.isNumeric()
		.withMessage('Price must be a number')
		.isFloat({ min: 0 })
		.withMessage('Price cannot be negative'),

	body('duration')
		.notEmpty()
		.withMessage('Duration is required')
		.isNumeric()
		.withMessage('Duration must be a number')
		.isInt({ min: 0 })
		.withMessage('Duration cannot be negative'),
];

export const updateCourseValidation = [
	param('id').isMongoId().withMessage('Invalid course ID'),

	body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 2000 })
		.withMessage('Description cannot exceed 2000 characters'),

	body('category')
		.optional()
		.isIn(['programming', 'design', 'business', 'marketing', 'other'])
		.withMessage('Invalid category'),

	body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),

	body('price')
		.optional()
		.isNumeric()
		.withMessage('Price must be a number')
		.isFloat({ min: 0 })
		.withMessage('Price cannot be negative'),

	body('duration')
		.optional()
		.isNumeric()
		.withMessage('Duration must be a number')
		.isInt({ min: 0 })
		.withMessage('Duration cannot be negative'),
];

export const getCourseByIdValidation = [param('id').isMongoId().withMessage('Invalid course ID')];

export const getCoursesValidation = [
	query('categoryId').optional().isMongoId().withMessage('Invalid category'),

	query('levelId').optional().isMongoId().withMessage('Invalid level'),

	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export default {
	createCourseValidation,
	updateCourseValidation,
	getCourseByIdValidation,
	getCoursesValidation,
};
