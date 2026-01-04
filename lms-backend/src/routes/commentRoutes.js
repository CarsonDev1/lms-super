import express from 'express';
import {
	createComment,
	getCourseComments,
	getCommentReplies,
	updateComment,
	deleteComment,
	toggleLikeComment,
} from '../controllers/commentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createComment);
router.get('/course/:courseId', getCourseComments);
router.get('/:commentId/replies', getCommentReplies);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);
router.post('/:commentId/like', toggleLikeComment);

export default router;
