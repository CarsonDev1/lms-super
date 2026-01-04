import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Get user's chat conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
export const getConversations = async (req, res) => {
	try {
		const userId = req.user._id;

		// Get unique conversations (distinct roomIds)
		const conversations = await ChatMessage.aggregate([
			{
				$match: {
					$or: [{ senderId: userId }, { receiverId: userId }],
				},
			},
			{
				$sort: { createdAt: -1 },
			},
			{
				$group: {
					_id: '$roomId',
					lastMessage: { $first: '$$ROOT' },
					unreadCount: {
						$sum: {
							$cond: [{ $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] }, 1, 0],
						},
					},
				},
			},
			{
				$sort: { 'lastMessage.createdAt': -1 },
			},
		]);

		// Populate user info
		const populatedConversations = await Promise.all(
			conversations.map(async (conv) => {
				const lastMsg = conv.lastMessage;
				const otherUserId =
					lastMsg.senderId.toString() === userId.toString() ? lastMsg.receiverId : lastMsg.senderId;
				const otherUser = await User.findById(otherUserId).select('name avatar isOnline lastSeen');

				return {
					roomId: conv._id,
					user: otherUser,
					lastMessage: {
						content: lastMsg.content,
						senderId: lastMsg.senderId,
						createdAt: lastMsg.createdAt,
						messageType: lastMsg.messageType,
					},
					unreadCount: conv.unreadCount,
				};
			})
		);

		res.status(200).json({
			success: true,
			data: populatedConversations,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch conversations',
		});
	}
};

/**
 * @swagger
 * /api/chat/messages/{userId}:
 *   get:
 *     summary: Get chat messages with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat messages
 */
export const getMessages = async (req, res) => {
	try {
		const { userId: otherUserId } = req.params;
		const { page = 1, limit = 50 } = req.query;
		const currentUserId = req.user._id;

		const roomId = ChatMessage.generateRoomId(currentUserId, otherUserId);

		const skip = (page - 1) * limit;

		const messages = await ChatMessage.find({ roomId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('senderId', 'name avatar')
			.populate('receiverId', 'name avatar');

		const total = await ChatMessage.countDocuments({ roomId });

		// Mark messages as read
		await ChatMessage.updateMany({ roomId, receiverId: currentUserId, isRead: false }, { isRead: true });

		res.status(200).json({
			success: true,
			data: {
				messages: messages.reverse(), // Reverse to show oldest first
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch messages',
		});
	}
};

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file, system]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Message sent
 */
export const sendMessage = async (req, res) => {
	try {
		const { receiverId, content, messageType = 'text', attachments = [] } = req.body;
		const senderId = req.user._id;

		// Validate receiver exists
		const receiver = await User.findById(receiverId);
		if (!receiver) {
			return res.status(404).json({
				success: false,
				message: 'Receiver not found',
			});
		}

		const roomId = ChatMessage.generateRoomId(senderId, receiverId);

		const message = await ChatMessage.create({
			roomId,
			senderId,
			receiverId,
			content,
			messageType,
			attachments,
		});

		const populatedMessage = await ChatMessage.findById(message._id)
			.populate('senderId', 'name avatar')
			.populate('receiverId', 'name avatar');

		// TODO: Emit socket event to receiver
		// io.to(receiverId.toString()).emit('new-message', populatedMessage);

		res.status(201).json({
			success: true,
			message: 'Message sent successfully',
			data: populatedMessage,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to send message',
		});
	}
};

/**
 * @swagger
 * /api/chat/mark-read/{userId}:
 *   put:
 *     summary: Mark all messages from a user as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
export const markAsRead = async (req, res) => {
	try {
		const { userId: otherUserId } = req.params;
		const currentUserId = req.user._id;

		const roomId = ChatMessage.generateRoomId(currentUserId, otherUserId);

		await ChatMessage.updateMany({ roomId, receiverId: currentUserId, isRead: false }, { isRead: true });

		res.status(200).json({
			success: true,
			message: 'Messages marked as read',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to mark messages as read',
		});
	}
};

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: Get total unread message count
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
export const getUnreadCount = async (req, res) => {
	try {
		const userId = req.user._id;

		const count = await ChatMessage.countDocuments({ receiverId: userId, isRead: false });

		res.status(200).json({
			success: true,
			data: { count },
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get unread count',
		});
	}
};

/**
 * @swagger
 * /api/chat/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *     responses:
 *       200:
 *         description: Message deleted
 */
export const deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user._id;

		const message = await ChatMessage.findOne({ _id: messageId, senderId: userId });

		if (!message) {
			return res.status(404).json({
				success: false,
				message: 'Message not found or unauthorized',
			});
		}

		await message.deleteOne();

		res.status(200).json({
			success: true,
			message: 'Message deleted',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete message',
		});
	}
};

export default {
	getConversations,
	getMessages,
	sendMessage,
	markAsRead,
	getUnreadCount,
	deleteMessage,
};
