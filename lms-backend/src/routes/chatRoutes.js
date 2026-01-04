import express from 'express';
import {
	getConversations,
	getMessages,
	sendMessage,
	markAsRead,
	getUnreadCount,
	deleteMessage,
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/messages/:userId', getMessages);
router.post('/send', sendMessage);
router.put('/mark-read/:userId', markAsRead);
router.get('/unread-count', getUnreadCount);
router.delete('/:messageId', deleteMessage);

export default router;
