import { body, param, query } from 'express-validator';

export const createCategoryValidation = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Name is required')
		.isLength({ max: 100 })
		.withMessage('Name cannot exceed 100 characters'),
];

export const updateCategoryValidation = [
	param('id').isMongoId().withMessage('Invalid category ID'),
	body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
];
export const getCategoryValidation = [param('id').isMongoId().withMessage('Invalid category ID')];

export const deleteCategoryValidation = [param('id').isMongoId().withMessage('Invalid category ID')];

export const getCategoryByIdValidation = [param('id').isMongoId().withMessage('Invalid category ID')];

export const listCategoriesValidation = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

export default {
	createCategoryValidation,
	updateCategoryValidation,
	getCategoryValidation,
	deleteCategoryValidation,
};
