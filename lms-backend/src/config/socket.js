import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger.js';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';

let io;

export const initializeSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: process.env.CORS_ORIGIN || '*',
			credentials: true,
		},
	});

	// Authentication middleware
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

			if (!token) {
				return next(new Error('Authentication error: Token missing'));
			}

			const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			const user = await User.findById(decoded.userId).select('-password');

			if (!user) {
				return next(new Error('Authentication error: User not found'));
			}

			socket.userId = user._id.toString();
			socket.user = user;
			next();
		} catch (error) {
			logger.error('Socket authentication error:', error);
			next(new Error('Authentication error: Invalid token'));
		}
	});

	io.on('connection', async (socket) => {
		logger.info(`User connected: ${socket.userId}`);

		// Join user's personal room for notifications
		socket.join(socket.userId);

		// Update user online status
		await User.findByIdAndUpdate(socket.userId, { isOnline: true });

		// Emit online status to all users
		io.emit('user-status', { userId: socket.userId, isOnline: true });

		// Join chat room
		socket.on('join-chat', (otherUserId) => {
			const roomId = ChatMessage.generateRoomId(socket.userId, otherUserId);
			socket.join(roomId);
			logger.info(`User ${socket.userId} joined chat room ${roomId}`);
		});

		// Leave chat room
		socket.on('leave-chat', (otherUserId) => {
			const roomId = ChatMessage.generateRoomId(socket.userId, otherUserId);
			socket.leave(roomId);
			logger.info(`User ${socket.userId} left chat room ${roomId}`);
		});

		// Send chat message
		socket.on('send-message', async (data) => {
			try {
				const { receiverId, content, messageType = 'text', attachments = [] } = data;

				const roomId = ChatMessage.generateRoomId(socket.userId, receiverId);

				const message = await ChatMessage.create({
					roomId,
					senderId: socket.userId,
					receiverId,
					content,
					messageType,
					attachments,
				});

				const populatedMessage = await ChatMessage.findById(message._id)
					.populate('senderId', 'name avatar')
					.populate('receiverId', 'name avatar');

				// Emit to room (both users)
				io.to(roomId).emit('new-message', populatedMessage);

				// Also emit to receiver's personal room for notification
				io.to(receiverId).emit('message-notification', {
					from: socket.user.name,
					message: content,
					messageId: message._id,
				});

				logger.info(`Message sent from ${socket.userId} to ${receiverId}`);
			} catch (error) {
				logger.error('Error sending message:', error);
				socket.emit('error', { message: 'Failed to send message' });
			}
		});

		// Typing indicator
		socket.on('typing', (data) => {
			const { receiverId } = data;
			const roomId = ChatMessage.generateRoomId(socket.userId, receiverId);
			socket.to(roomId).emit('user-typing', {
				userId: socket.userId,
				userName: socket.user.name,
			});
		});

		// Stop typing indicator
		socket.on('stop-typing', (data) => {
			const { receiverId } = data;
			const roomId = ChatMessage.generateRoomId(socket.userId, receiverId);
			socket.to(roomId).emit('user-stop-typing', {
				userId: socket.userId,
			});
		});

		// Mark messages as read
		socket.on('mark-read', async (data) => {
			try {
				const { otherUserId } = data;
				const roomId = ChatMessage.generateRoomId(socket.userId, otherUserId);

				await ChatMessage.updateMany({ roomId, receiverId: socket.userId, isRead: false }, { isRead: true });

				// Notify sender that messages were read
				socket.to(roomId).emit('messages-read', { userId: socket.userId });
			} catch (error) {
				logger.error('Error marking messages as read:', error);
			}
		});

		// Handle disconnection
		socket.on('disconnect', async () => {
			logger.info(`User disconnected: ${socket.userId}`);

			// Update user offline status
			await User.findByIdAndUpdate(socket.userId, {
				isOnline: false,
				lastSeen: new Date(),
			});

			// Emit offline status to all users
			io.emit('user-status', { userId: socket.userId, isOnline: false });
		});
	});

	return io;
};

// Helper function to emit notifications
export const emitNotification = (userId, notification) => {
	if (io) {
		io.to(userId.toString()).emit('notification', notification);
	}
};

// Helper function to emit to all users
export const emitToAll = (event, data) => {
	if (io) {
		io.emit(event, data);
	}
};

// Helper function to emit to specific room
export const emitToRoom = (roomId, event, data) => {
	if (io) {
		io.to(roomId).emit(event, data);
	}
};

export const getIO = () => {
	if (!io) {
		throw new Error('Socket.io not initialized');
	}
	return io;
};

export default { initializeSocket, emitNotification, emitToAll, emitToRoom, getIO };
