import Review from '../models/Review.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a course review
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               courseId:
 *                 type: string
 *               rating:
 *                 type: number
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
export const createReview = async (req, res) => {
	try {
		const { courseId, rating, review } = req.body;
		const userId = req.user._id;

		// Check if user is enrolled
		const enrollment = await Enrollment.findOne({ userId, courseId });
		if (!enrollment) {
			return res.status(403).json({
				success: false,
				message: 'You must be enrolled in this course to leave a review',
			});
		}

		// Check if user already reviewed
		const existingReview = await Review.findOne({ userId, courseId });
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: 'You have already reviewed this course',
			});
		}

		const newReview = await Review.create({
			userId,
			courseId,
			rating,
			review,
			isVerifiedPurchase: true,
		});

		const populatedReview = await Review.findById(newReview._id).populate('userId', 'name avatar');

		// Notify instructor
		const course = await Course.findById(courseId);
		if (course) {
			await Notification.create({
				userId: course.instructor,
				type: 'review',
				title: 'New Review',
				message: `${req.user.name} left a ${rating}-star review on your course`,
				link: `/courses/${courseId}`,
				metadata: { reviewId: newReview._id, courseId },
			});
		}

		res.status(201).json({
			success: true,
			message: 'Review created successfully',
			data: populatedReview,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create review',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/reviews/course/{courseId}:
 *   get:
 *     summary: Get reviews for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
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
 *         description: List of reviews
 */
export const getCourseReviews = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { rating, page = 1, limit = 10 } = req.query;

		const query = { courseId };
		if (rating) {
			query.rating = parseInt(rating);
		}

		const skip = (page - 1) * limit;

		const reviews = await Review.find(query)
			.populate('userId', 'name avatar')
			.sort({ isFeatured: -1, createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Review.countDocuments(query);

		// Get rating distribution
		const ratingDistribution = await Review.aggregate([
			{ $match: { courseId: courseId } },
			{ $group: { _id: '$rating', count: { $sum: 1 } } },
			{ $sort: { _id: -1 } },
		]);

		res.status(200).json({
			success: true,
			data: {
				reviews,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
				ratingDistribution,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch reviews',
		});
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
export const updateReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const { rating, review } = req.body;
		const userId = req.user._id;

		const existingReview = await Review.findOne({ _id: reviewId, userId });

		if (!existingReview) {
			return res.status(404).json({
				success: false,
				message: 'Review not found or unauthorized',
			});
		}

		if (rating !== undefined) existingReview.rating = rating;
		if (review !== undefined) existingReview.review = review;
		existingReview.isEdited = true;
		existingReview.editedAt = new Date();

		await existingReview.save();

		const updatedReview = await Review.findById(reviewId).populate('userId', 'name avatar');

		res.status(200).json({
			success: true,
			message: 'Review updated successfully',
			data: updatedReview,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update review',
		});
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *     responses:
 *       200:
 *         description: Review deleted
 */
export const deleteReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const userId = req.user._id;

		const review = await Review.findOneAndDelete({
			_id: reviewId,
			userId,
		});

		if (!review) {
			return res.status(404).json({
				success: false,
				message: 'Review not found or unauthorized',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Review deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete review',
		});
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}/helpful:
 *   post:
 *     summary: Mark review as helpful
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *     responses:
 *       200:
 *         description: Review marked as helpful
 */
export const markReviewHelpful = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const userId = req.user._id;

		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({
				success: false,
				message: 'Review not found',
			});
		}

		const likeIndex = review.likes.findIndex((id) => id.toString() === userId.toString());

		if (likeIndex > -1) {
			review.likes.splice(likeIndex, 1);
			review.helpfulCount = Math.max(0, review.helpfulCount - 1);
		} else {
			review.likes.push(userId);
			review.helpfulCount += 1;
		}

		await review.save();

		res.status(200).json({
			success: true,
			message: likeIndex > -1 ? 'Removed helpful mark' : 'Marked as helpful',
			data: {
				helpfulCount: review.helpfulCount,
				isHelpful: likeIndex === -1,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to mark review as helpful',
		});
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}/reply:
 *   post:
 *     summary: Instructor reply to review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added
 */
export const replyToReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const { message } = req.body;
		const userId = req.user._id;

		const review = await Review.findById(reviewId).populate('courseId');

		if (!review) {
			return res.status(404).json({
				success: false,
				message: 'Review not found',
			});
		}

		// Check if user is the course instructor
		if (review.courseId.instructor.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Only the course instructor can reply to reviews',
			});
		}

		review.instructorReply = {
			message,
			repliedAt: new Date(),
		};

		await review.save();

		// Notify review author
		await Notification.create({
			userId: review.userId,
			type: 'instructor_reply',
			title: 'Instructor Reply',
			message: `The instructor replied to your review`,
			link: `/courses/${review.courseId._id}`,
			metadata: { reviewId: review._id },
		});

		res.status(200).json({
			success: true,
			message: 'Reply added successfully',
			data: review,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to reply to review',
		});
	}
};

export default {
	createReview,
	getCourseReviews,
	updateReview,
	deleteReview,
	markReviewHelpful,
	replyToReview,
};
