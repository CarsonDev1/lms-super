import express from 'express';
import { getLevels, getLevelById, createLevel, updateLevel, deleteLevel } from '../controllers/levelController.js';
import {
	createLevelValidation,
	updateLevelValidation,
	getLevelByIdValidation,
	getLevelsValidation,
} from '../validators/levelValidator.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Levels
 *   description: Course level management
 */

// Public routes
router.get('/', getLevelsValidation, validate, getLevels);
router.get('/:id', getLevelByIdValidation, validate, getLevelById);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), createLevelValidation, validate, createLevel);
router.put('/:id', authenticate, authorize('admin'), updateLevelValidation, validate, updateLevel);
router.delete('/:id', authenticate, authorize('admin'), getLevelByIdValidation, validate, deleteLevel);

export default router;
