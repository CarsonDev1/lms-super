import express from 'express';
import {
	generateStudyPlan,
	getStudyPlans,
	getStudyPlanById,
	getTodaySession,
	completeSession,
	markSessionMissed,
	rescheduleSession,
	regenerateStudyPlan,
	updatePreferences,
	deleteStudyPlan,
} from '../controllers/studyPlanController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/study-plans/generate:
 *   post:
 *     summary: Generate a personalized study plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enrollmentId
 *               - dailyStudyMinutes
 *               - targetCompletionDate
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               dailyStudyMinutes:
 *                 type: number
 *                 example: 60
 *               studyDays:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3, 4, 5]
 *               targetCompletionDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Study plan generated successfully
 *       404:
 *         description: Enrollment not found
 */
router.post('/generate', generateStudyPlan);

/**
 * @swagger
 * /api/study-plans:
 *   get:
 *     summary: Get user's study plans
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed, abandoned]
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of study plans
 */
router.get('/', getStudyPlans);

/**
 * @swagger
 * /api/study-plans/{id}:
 *   get:
 *     summary: Get study plan by ID
 *     tags: [Study Plans]
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
 *         description: Study plan details
 *       404:
 *         description: Study plan not found
 */
router.get('/:id', getStudyPlanById);

/**
 * @swagger
 * /api/study-plans/{id}/today:
 *   get:
 *     summary: Get today's session
 *     tags: [Study Plans]
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
 *         description: Today's session
 */
router.get('/:id/today', getTodaySession);

/**
 * @swagger
 * /api/study-plans/{id}/sessions/{sessionId}/complete:
 *   put:
 *     summary: Complete a study session
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualDuration:
 *                 type: number
 *     responses:
 *       200:
 *         description: Session completed
 */
router.put('/:id/sessions/:sessionId/complete', completeSession);

router.put('/:id/sessions/:sessionId/missed', markSessionMissed);
router.put('/:id/sessions/:sessionId/reschedule', rescheduleSession);

/**
 * @swagger
 * /api/study-plans/{id}/regenerate:
 *   post:
 *     summary: Regenerate study plan with new parameters
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyStudyMinutes:
 *                 type: number
 *               studyDays:
 *                 type: array
 *                 items:
 *                   type: number
 *               targetCompletionDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Study plan regenerated
 */
router.post('/:id/regenerate', regenerateStudyPlan);

router.put('/:id/preferences', updatePreferences);
router.delete('/:id', deleteStudyPlan);

export default router;
