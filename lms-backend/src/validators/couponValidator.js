import { body } from 'express-validator';

export const createCouponValidation = [
	body('code')
		.trim()
		.notEmpty()
		.withMessage('Coupon code is required')
		.isLength({ min: 3, max: 50 })
		.withMessage('Code must be 3–50 characters')
		.toUpperCase(),

	body('type')
		.notEmpty()
		.withMessage('Discount type is required')
		.isIn(['percentage', 'fixed'])
		.withMessage('Type must be percentage or fixed'),

	body('value')
		.notEmpty()
		.withMessage('Discount value is required')
		.isFloat({ min: 0 })
		.withMessage('Value must be a positive number'),

	body('value').custom((value, { req }) => {
		if (req.body.type === 'percentage' && value > 100) {
			throw new Error('Percentage discount cannot exceed 100');
		}
		return true;
	}),

	body('validFrom').optional().isISO8601().withMessage('Invalid start date'),

	body('validTo')
		.optional()
		.isISO8601()
		.withMessage('Invalid end date')
		.custom((validTo, { req }) => {
			if (req.body.validFrom && new Date(validTo) <= new Date(req.body.validFrom)) {
				throw new Error('End date must be after start date');
			}
			return true;
		}),

	body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be at least 1'),

	body('maxUsesPerUser')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Max uses per user must be at least 1'),

	body('minimumPurchase')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Minimum purchase must be a positive number'),

	body('maxDiscount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Max discount must be a positive number'),

	body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updateCouponValidation = [
	body('type')
		.optional()
		.isIn(['percentage', 'fixed'])
		.withMessage('Type must be percentage or fixed'),

	body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),

	body('validFrom').optional().isISO8601().withMessage('Invalid start date'),

	body('validTo').optional().isISO8601().withMessage('Invalid end date'),

	body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be at least 1'),

	body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
