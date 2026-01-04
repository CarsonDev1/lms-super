import Notification from '../models/Notification.js';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications
 */
export const getNotifications = async (req, res) => {
	try {
		const { page = 1, limit = 20, unreadOnly } = req.query;
		const userId = req.user._id;

		const query = { userId };
		if (unreadOnly === 'true') {
			query.isRead = false;
		}

		const skip = (page - 1) * limit;

		const notifications = await Notification.find(query)
			.sort({ priority: -1, createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Notification.countDocuments(query);
		const unreadCount = await Notification.countDocuments({ userId, isRead: false });

		res.status(200).json({
			success: true,
			data: {
				notifications,
				unreadCount,
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
			message: 'Failed to fetch notifications',
		});
	}
};

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
export const markAsRead = async (req, res) => {
	try {
		const { notificationId } = req.params;
		const userId = req.user._id;

		const notification = await Notification.findOne({ _id: notificationId, userId });

		if (!notification) {
			return res.status(404).json({
				success: false,
				message: 'Notification not found',
			});
		}

		await notification.markAsRead();

		res.status(200).json({
			success: true,
			message: 'Notification marked as read',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to mark notification as read',
		});
	}
};

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
export const markAllAsRead = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });

		res.status(200).json({
			success: true,
			message: 'All notifications marked as read',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to mark all notifications as read',
		});
	}
};

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *     responses:
 *       200:
 *         description: Notification deleted
 */
export const deleteNotification = async (req, res) => {
	try {
		const { notificationId } = req.params;
		const userId = req.user._id;

		const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

		if (!notification) {
			return res.status(404).json({
				success: false,
				message: 'Notification not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Notification deleted',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete notification',
		});
	}
};

/**
 * @swagger
 * /api/notifications/clear-all:
 *   delete:
 *     summary: Clear all read notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Read notifications cleared
 */
export const clearAllRead = async (req, res) => {
	try {
		const userId = req.user._id;

		const result = await Notification.deleteMany({ userId, isRead: true });

		res.status(200).json({
			success: true,
			message: `${result.deletedCount} read notifications cleared`,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to clear notifications',
		});
	}
};

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
export const getUnreadCount = async (req, res) => {
	try {
		const userId = req.user._id;

		const count = await Notification.countDocuments({ userId, isRead: false });

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

export default {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	clearAllRead,
	getUnreadCount,
};
