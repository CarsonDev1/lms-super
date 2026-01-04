import express from 'express';
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	clearAllRead,
	getUnreadCount,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/clear-all', clearAllRead);

export default router;
