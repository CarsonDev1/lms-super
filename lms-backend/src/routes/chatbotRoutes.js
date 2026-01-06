import express from 'express';
import {
	startConversation,
	getConversation,
	getUserConversations,
	sendMessage,
	captureLead,
	transferToAgent,
	closeConversation,
	getAllConversations,
	getChatbotAnalytics,
} from '../controllers/chatbotController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/chatbot/conversations:
 *   post:
 *     summary: Start a new chatbot conversation
 *     tags: [Chatbot]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               initialMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                     conversation:
 *                       $ref: '#/components/schemas/ChatbotConversation'
 */
router.post('/conversations', startConversation);

/**
 * @swagger
 * /api/chatbot/conversations/{sessionId}:
 *   get:
 *     summary: Get conversation by session ID
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation retrieved
 */
router.get('/conversations/:sessionId', getConversation);

/**
 * @swagger
 * /api/chatbot/conversations/{sessionId}/messages:
 *   post:
 *     summary: Send a message in conversation
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: What courses do you offer?
 *     responses:
 *       200:
 *         description: Message sent and response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userMessage:
 *                       type: object
 *                     botResponse:
 *                       type: object
 */
router.post('/conversations/:sessionId/messages', sendMessage);

/**
 * @swagger
 * /api/chatbot/conversations/{sessionId}/capture-lead:
 *   post:
 *     summary: Capture lead information
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead captured successfully
 */
router.post('/conversations/:sessionId/capture-lead', captureLead);

/**
 * @swagger
 * /api/chatbot/conversations/{sessionId}/transfer:
 *   post:
 *     summary: Transfer conversation to human agent
 *     tags: [Chatbot]
 *     parameters:
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transferred to agent
 */
router.post('/conversations/:sessionId/transfer', transferToAgent);

/**
 * @swagger
 * /api/chatbot/conversations/{sessionId}/close:
 *   post:
 *     summary: Close a conversation
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation closed
 */
router.post('/conversations/:sessionId/close', closeConversation);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/chatbot/conversations/user/{userId}:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversations retrieved
 */
router.get('/conversations/user/:userId', getUserConversations);

/**
 * @swagger
 * /api/chatbot/conversations:
 *   get:
 *     summary: Get all conversations (Admin)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, transferred, closed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: All conversations retrieved
 */
router.get('/conversations', authorize('admin'), getAllConversations);

/**
 * @swagger
 * /api/chatbot/analytics:
 *   get:
 *     summary: Get chatbot analytics (Admin)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalConversations:
 *                       type: number
 *                     activeConversations:
 *                       type: number
 *                     transferredConversations:
 *                       type: number
 *                     leadsCaptured:
 *                       type: number
 *                     averageMessagesPerConversation:
 *                       type: number
 *                     averageResponseTime:
 *                       type: number
 */
router.get('/analytics', authorize('admin'), getChatbotAnalytics);

export default router;
