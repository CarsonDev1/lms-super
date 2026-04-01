import { body } from 'express-validator';

export const createAnnouncementValidation = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Title is required')
		.isLength({ min: 3, max: 200 })
		.withMessage('Title must be 3–200 characters'),

	body('content')
		.trim()
		.notEmpty()
		.withMessage('Content is required')
		.isLength({ min: 10 })
		.withMessage('Content must be at least 10 characters'),

	body('type')
		.optional()
		.isIn(['info', 'warning', 'success', 'error', 'maintenance', 'feature'])
		.withMessage('Invalid announcement type'),

	body('priority')
		.optional()
		.isIn(['low', 'medium', 'high', 'urgent'])
		.withMessage('Invalid priority level'),

	body('status')
		.optional()
		.isIn(['draft', 'scheduled', 'active', 'expired', 'archived'])
		.withMessage('Invalid status'),

	body('targetAudience.scope')
		.optional()
		.isIn(['all', 'role', 'course', 'user'])
		.withMessage('Invalid target scope'),

	body('targetAudience.roles')
		.optional()
		.isArray()
		.withMessage('Roles must be an array'),

	body('scheduledAt')
		.optional()
		.isISO8601()
		.withMessage('Invalid scheduled date'),

	body('expiresAt')
		.optional()
		.isISO8601()
		.withMessage('Invalid expiry date'),
];

export const updateAnnouncementValidation = [
	body('title')
		.optional()
		.trim()
		.isLength({ min: 3, max: 200 })
		.withMessage('Title must be 3–200 characters'),

	body('content')
		.optional()
		.trim()
		.isLength({ min: 10 })
		.withMessage('Content must be at least 10 characters'),

	body('type')
		.optional()
		.isIn(['info', 'warning', 'success', 'error', 'maintenance', 'feature'])
		.withMessage('Invalid announcement type'),

	body('priority')
		.optional()
		.isIn(['low', 'medium', 'high', 'urgent'])
		.withMessage('Invalid priority level'),

	body('status')
		.optional()
		.isIn(['draft', 'scheduled', 'active', 'expired', 'archived'])
		.withMessage('Invalid status'),
];
