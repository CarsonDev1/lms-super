import express from 'express';
import {
	getCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
	createCategoryValidation,
	updateCategoryValidation,
	deleteCategoryValidation,
	getCategoryByIdValidation,
} from '../validators/categoryValidator.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */
// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryByIdValidation, validate, getCategoryById);

// Protected routes - Admin only
router.post('/', authenticate, authorize('admin'), createCategoryValidation, validate, createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategoryValidation, validate, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategoryValidation, validate, deleteCategory);

export default router;
