import express from 'express';
import {
	getAnnouncements,
	getActiveAnnouncements,
	getAnnouncementById,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement,
	activateAnnouncement,
	deactivateAnnouncement,
	markAsViewed,
	dismissAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
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
 *                     $ref: '#/components/schemas/Announcement'
 */
router.get('/', getAnnouncements);

/**
 * @swagger
 * /api/announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement retrieved successfully
 */
router.get('/:id', getAnnouncementById);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/announcements/active:
 *   get:
 *     summary: Get active announcements for current user
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active announcements retrieved
 */
router.get('/active', getActiveAnnouncements);

/**
 * @swagger
 * /api/announcements/{id}/view:
 *   post:
 *     summary: Mark announcement as viewed
 *     tags: [Announcements]
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
 *         description: Announcement marked as viewed
 */
router.post('/:id/view', markAsViewed);

/**
 * @swagger
 * /api/announcements/{id}/dismiss:
 *   post:
 *     summary: Dismiss an announcement
 *     tags: [Announcements]
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
 *         description: Announcement dismissed
 */
router.post('/:id/dismiss', dismissAnnouncement);

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create a new announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Feature Released
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [all, student, instructor, admin]
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */
router.post('/', authorize('admin'), createAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}:
 *   put:
 *     summary: Update an announcement
 *     tags: [Announcements]
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
 *         description: Announcement updated successfully
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Announcements]
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
 *         description: Announcement deleted successfully
 */
router.put('/:id', authorize('admin'), updateAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}/activate:
 *   put:
 *     summary: Activate an announcement
 *     tags: [Announcements]
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
 *         description: Announcement activated
 */
router.put('/:id/activate', authorize('admin'), activateAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}/deactivate:
 *   put:
 *     summary: Deactivate an announcement
 *     tags: [Announcements]
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
 *         description: Announcement deactivated
 */
router.put('/:id/deactivate', authorize('admin'), deactivateAnnouncement);

export default router;
