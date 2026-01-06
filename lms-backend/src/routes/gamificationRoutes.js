import express from 'express';
import {
	getAchievements,
	getAchievementById,
	createAchievement,
	updateAchievement,
	deleteAchievement,
	getUserProgress,
	getUserProgressById,
	addXP,
	addCups,
	unlockAchievement,
	updateDailyGoals,
	updateStreak,
	getLeaderboard,
	getUserRanking,
} from '../controllers/gamificationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/gamification/achievements:
 *   get:
 *     summary: Get all achievements
 *     tags: [Gamification]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [learning, social, streak, completion, speed, perfection]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [badge, trophy, milestone, special]
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *           enum: [common, rare, epic, legendary]
 *     responses:
 *       200:
 *         description: List of achievements
 */
router.get('/achievements', getAchievements);

router.get('/achievements/:id', getAchievementById);

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Gamification]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [xp, cups, streak]
 *           default: xp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 100
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/gamification/progress:
 *   get:
 *     summary: Get current user's progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User progress with XP, level, achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProgress'
 */
router.get('/progress', getUserProgress);

router.get('/progress/:userId', getUserProgressById);
router.get('/progress/ranking', getUserRanking);

/**
 * @swagger
 * /api/gamification/progress/add-xp:
 *   post:
 *     summary: Add XP to user
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *               source:
 *                 type: string
 *                 example: "lesson_completed"
 *     responses:
 *       200:
 *         description: XP added successfully
 */
router.post('/progress/add-xp', addXP);

/**
 * @swagger
 * /api/gamification/progress/add-cups:
 *   post:
 *     summary: Add cups to user
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Cups added successfully
 */
router.post('/progress/add-cups', addCups);

/**
 * @swagger
 * /api/gamification/progress/unlock-achievement:
 *   post:
 *     summary: Unlock achievement for user
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - achievementId
 *             properties:
 *               achievementId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Achievement unlocked
 */
router.post('/progress/unlock-achievement', unlockAchievement);

router.put('/progress/daily-goals', updateDailyGoals);
router.post('/progress/update-streak', updateStreak);

// Admin routes
/**
 * @swagger
 * /api/gamification/achievements:
 *   post:
 *     summary: Create new achievement (Admin only)
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - description
 *               - category
 *               - icon
 *             properties:
 *               code:
 *                 type: string
 *                 example: "FIRST_COURSE"
 *               name:
 *                 type: string
 *                 example: "First Steps"
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [badge, trophy, milestone, special]
 *               category:
 *                 type: string
 *                 enum: [learning, social, streak, completion, speed, perfection]
 *               icon:
 *                 type: string
 *               xpReward:
 *                 type: number
 *               cupsReward:
 *                 type: number
 *               rarity:
 *                 type: string
 *                 enum: [common, rare, epic, legendary]
 *     responses:
 *       201:
 *         description: Achievement created
 */
router.post('/achievements', authorize('admin'), createAchievement);

router.put('/achievements/:id', authorize('admin'), updateAchievement);
router.delete('/achievements/:id', authorize('admin'), deleteAchievement);

export default router;
