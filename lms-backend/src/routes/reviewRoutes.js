import express from 'express';
import {
	createReview,
	getCourseReviews,
	updateReview,
	deleteReview,
	markReviewHelpful,
	replyToReview,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public route (no auth required)
router.get('/course/:courseId', getCourseReviews);

// Authenticated routes
router.use(authenticate);

router.post('/', createReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);
router.post('/:reviewId/helpful', markReviewHelpful);

// Instructor/Admin route
router.post('/:reviewId/reply', authorize('instructor', 'admin'), replyToReview);

export default router;
