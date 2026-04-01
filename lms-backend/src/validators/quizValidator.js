import { body } from 'express-validator';

export const createQuizValidation = [
	body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid course ID'),

	body('title')
		.trim()
		.notEmpty()
		.withMessage('Quiz title is required')
		.isLength({ min: 3, max: 200 })
		.withMessage('Title must be 3–200 characters'),

	body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),

	body('passingScore')
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage('Passing score must be between 0 and 100'),

	body('duration')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Duration must be at least 1 minute'),

	body('maxAttempts')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Max attempts must be at least 1'),

	body('difficulty')
		.optional()
		.isIn(['easy', 'medium', 'hard'])
		.withMessage('Difficulty must be easy, medium, or hard'),

	body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),

	body('questions').optional().isArray().withMessage('Questions must be an array'),

	body('questions.*.questionText')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Question text is required'),

	body('questions.*.type')
		.optional()
		.isIn(['multiple_choice', 'true_false', 'short_answer'])
		.withMessage('Invalid question type'),

	body('questions.*.points')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Points must be at least 1'),
];

export const updateQuizValidation = [
	body('title')
		.optional()
		.trim()
		.isLength({ min: 3, max: 200 })
		.withMessage('Title must be 3–200 characters'),

	body('passingScore')
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage('Passing score must be between 0 and 100'),

	body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),

	body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be at least 1'),

	body('difficulty')
		.optional()
		.isIn(['easy', 'medium', 'hard'])
		.withMessage('Difficulty must be easy, medium, or hard'),

	body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
];

export const submitQuizValidation = [
	body('answers').isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),

	body('answers.*.questionId')
		.notEmpty()
		.withMessage('Question ID is required for each answer')
		.isMongoId()
		.withMessage('Invalid question ID'),

	body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive number'),
];
