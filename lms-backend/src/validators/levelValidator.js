import { body, param, query } from 'express-validator';

export const createLevelValidation = [
	body('name')
		.notEmpty()
		.withMessage('Level name is required')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Level name must be between 2 and 50 characters'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Description cannot exceed 500 characters'),

	body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
];

export const updateLevelValidation = [
	param('id').isMongoId().withMessage('Invalid level ID'),

	body('name')
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Level name must be between 2 and 50 characters'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Description cannot exceed 500 characters'),

	body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),

	body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const getLevelByIdValidation = [param('id').isMongoId().withMessage('Invalid level ID')];

export const getLevelsValidation = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export default {
	createLevelValidation,
	updateLevelValidation,
	getLevelByIdValidation,
	getLevelsValidation,
};
