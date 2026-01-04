import Comment from '../models/Comment.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - content
 *             properties:
 *               courseId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               content:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
export const createComment = async (req, res) => {
	try {
		const { courseId, lessonId, content, parentId } = req.body;
		const userId = req.user._id;

		// Validate course exists
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Extract mentions from content (@username)
		const mentionRegex = /@(\w+)/g;
		const mentionedUsernames = content.match(mentionRegex);
		const mentions = [];

		if (mentionedUsernames) {
			const usernames = mentionedUsernames.map((m) => m.slice(1));
			const mentionedUsers = await User.find({ name: { $in: usernames } });
			mentions.push(...mentionedUsers.map((u) => u._id));
		}

		const comment = await Comment.create({
			userId,
			courseId,
			lessonId,
			content,
			parentId,
			mentions,
		});

		// Update reply count for parent comment
		if (parentId) {
			await Comment.incrementReplyCount(parentId);

			// Notify parent comment author
			const parentComment = await Comment.findById(parentId);
			if (parentComment && parentComment.userId.toString() !== userId.toString()) {
				await Notification.create({
					userId: parentComment.userId,
					type: 'reply',
					title: 'New Reply',
					message: `${req.user.name} replied to your comment`,
					link: `/courses/${courseId}`,
					metadata: { commentId: comment._id, courseId },
				});
			}
		}

		// Notify mentioned users
		for (const mentionedUserId of mentions) {
			if (mentionedUserId.toString() !== userId.toString()) {
				await Notification.create({
					userId: mentionedUserId,
					type: 'mention',
					title: 'You were mentioned',
					message: `${req.user.name} mentioned you in a comment`,
					link: `/courses/${courseId}`,
					metadata: { commentId: comment._id, courseId },
				});
			}
		}

		const populatedComment = await Comment.findById(comment._id)
			.populate('userId', 'name avatar')
			.populate('mentions', 'name');

		res.status(201).json({
			success: true,
			message: 'Comment created successfully',
			data: populatedComment,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create comment',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/comments/course/{courseId}:
 *   get:
 *     summary: Get comments for a course
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
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
 *         description: List of comments
 */
export const getCourseComments = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { lessonId, page = 1, limit = 20 } = req.query;

		const query = {
			courseId,
			isDeleted: false,
			parentId: null, // Only get top-level comments
		};

		if (lessonId) {
			query.lessonId = lessonId;
		}

		const skip = (page - 1) * limit;

		const comments = await Comment.find(query)
			.populate('userId', 'name avatar')
			.populate('mentions', 'name')
			.sort({ isPinned: -1, createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Comment.countDocuments(query);

		res.status(200).json({
			success: true,
			data: {
				comments,
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
			message: 'Failed to fetch comments',
		});
	}
};

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *     responses:
 *       200:
 *         description: List of replies
 */
export const getCommentReplies = async (req, res) => {
	try {
		const { commentId } = req.params;

		const replies = await Comment.find({
			parentId: commentId,
			isDeleted: false,
		})
			.populate('userId', 'name avatar')
			.populate('mentions', 'name')
			.sort({ createdAt: 1 });

		res.status(200).json({
			success: true,
			data: replies,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch replies',
		});
	}
};

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
export const updateComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content } = req.body;
		const userId = req.user._id;

		const comment = await Comment.findOne({ _id: commentId, userId });

		if (!comment) {
			return res.status(404).json({
				success: false,
				message: 'Comment not found or unauthorized',
			});
		}

		comment.content = content;
		comment.isEdited = true;
		comment.editedAt = new Date();
		await comment.save();

		const updatedComment = await Comment.findById(commentId)
			.populate('userId', 'name avatar')
			.populate('mentions', 'name');

		res.status(200).json({
			success: true,
			message: 'Comment updated successfully',
			data: updatedComment,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update comment',
		});
	}
};

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export const deleteComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const userId = req.user._id;

		const comment = await Comment.findOne({
			_id: commentId,
			$or: [{ userId }, { userId: req.user.role === 'admin' }],
		});

		if (!comment) {
			return res.status(404).json({
				success: false,
				message: 'Comment not found or unauthorized',
			});
		}

		comment.isDeleted = true;
		comment.deletedAt = new Date();
		await comment.save();

		// Update reply count for parent comment
		if (comment.parentId) {
			await Comment.decrementReplyCount(comment.parentId);
		}

		res.status(200).json({
			success: true,
			message: 'Comment deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete comment',
		});
	}
};

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     summary: Like/unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *     responses:
 *       200:
 *         description: Comment liked/unliked
 */
export const toggleLikeComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const userId = req.user._id;

		const comment = await Comment.findById(commentId);

		if (!comment) {
			return res.status(404).json({
				success: false,
				message: 'Comment not found',
			});
		}

		const likeIndex = comment.likes.findIndex((id) => id.toString() === userId.toString());

		if (likeIndex > -1) {
			// Unlike
			comment.likes.splice(likeIndex, 1);
		} else {
			// Like
			comment.likes.push(userId);

			// Notify comment author
			if (comment.userId.toString() !== userId.toString()) {
				await Notification.create({
					userId: comment.userId,
					type: 'like',
					title: 'New Like',
					message: `${req.user.name} liked your comment`,
					link: `/courses/${comment.courseId}`,
					metadata: { commentId: comment._id },
				});
			}
		}

		await comment.save();

		res.status(200).json({
			success: true,
			message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
			data: {
				likeCount: comment.likes.length,
				isLiked: likeIndex === -1,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to toggle like',
		});
	}
};

export default {
	createComment,
	getCourseComments,
	getCommentReplies,
	updateComment,
	deleteComment,
	toggleLikeComment,
};
