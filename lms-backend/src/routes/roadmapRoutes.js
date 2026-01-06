import express from 'express';
import {
	getRoadmapLevels,
	getRoadmapLevelById,
	createRoadmapLevel,
	updateRoadmapLevel,
	deleteRoadmapLevel,
	getUserRoadmapProgress,
	checkLevelUnlock,
	unlockLevel,
	completeLevel,
	updateLessonProgress,
} from '../controllers/roadmapController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/roadmap/courses/{courseId}/levels:
 *   get:
 *     summary: Get all roadmap levels for a course
 *     tags: [Roadmap]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Roadmap levels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RoadmapLevel'
 */
router.get('/courses/:courseId/levels', getRoadmapLevels);

/**
 * @swagger
 * /api/roadmap/levels/{id}:
 *   get:
 *     summary: Get roadmap level by ID
 *     tags: [Roadmap]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Roadmap level ID
 *     responses:
 *       200:
 *         description: Roadmap level retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RoadmapLevel'
 */
router.get('/levels/:id', getRoadmapLevelById);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/roadmap/progress/courses/{courseId}:
 *   get:
 *     summary: Get user's roadmap progress for a course
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 */
router.get('/progress/courses/:courseId', getUserRoadmapProgress);

/**
 * @swagger
 * /api/roadmap/progress/levels/{levelId}/check-unlock:
 *   get:
 *     summary: Check if user can unlock a level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check result
 */
router.get('/progress/levels/:levelId/check-unlock', checkLevelUnlock);

/**
 * @swagger
 * /api/roadmap/progress/levels/{levelId}/unlock:
 *   post:
 *     summary: Unlock a roadmap level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level unlocked successfully
 */
router.post('/progress/levels/:levelId/unlock', unlockLevel);

/**
 * @swagger
 * /api/roadmap/progress/levels/{levelId}/complete:
 *   post:
 *     summary: Mark a level as completed
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level completed successfully
 */
router.post('/progress/levels/:levelId/complete', completeLevel);

/**
 * @swagger
 * /api/roadmap/progress/levels/{levelId}/lessons/{lessonId}:
 *   post:
 *     summary: Update lesson progress in a level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lesson progress updated
 */
router.post('/progress/levels/:levelId/lessons/:lessonId', updateLessonProgress);

/**
 * @swagger
 * /api/roadmap/levels:
 *   post:
 *     summary: Create a new roadmap level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - levelNumber
 *               - title
 *             properties:
 *               course:
 *                 type: string
 *               levelNumber:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               lessons:
 *                 type: array
 *     responses:
 *       201:
 *         description: Level created successfully
 */
router.post('/levels', authorize('admin', 'instructor'), createRoadmapLevel);

/**
 * @swagger
 * /api/roadmap/levels/{id}:
 *   put:
 *     summary: Update a roadmap level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level updated successfully
 *   delete:
 *     summary: Delete a roadmap level
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level deleted successfully
 */
router.put('/levels/:id', authorize('admin', 'instructor'), updateRoadmapLevel);
router.delete('/levels/:id', authorize('admin', 'instructor'), deleteRoadmapLevel);

export default router;
