import express from 'express';
import {
	createQuiz,
	getCourseQuizzes,
	getQuizById,
	updateQuiz,
	deleteQuiz,
	submitQuiz,
	getAttemptResults,
	getQuizAttempts,
} from '../controllers/quizController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Student routes
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:quizId', getQuizById);
router.post('/:quizId/submit', submitQuiz);
router.get('/attempts/:attemptId', getAttemptResults);
router.get('/:quizId/attempts', getQuizAttempts);

// Instructor routes
router.post('/', authorize('instructor', 'admin'), createQuiz);
router.put('/:quizId', authorize('instructor', 'admin'), updateQuiz);
router.delete('/:quizId', authorize('instructor', 'admin'), deleteQuiz);

export default router;
