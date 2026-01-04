import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz (Instructor only)
 *     tags: [Quizzes]
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
 *               - title
 *               - questions
 *             properties:
 *               courseId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *               passingScore:
 *                 type: number
 *               timeLimit:
 *                 type: number
 *               attemptsAllowed:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz created
 */
export const createQuiz = async (req, res) => {
	try {
		const { courseId, ...quizData } = req.body;

		// Verify course ownership
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		if (course.instructor.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You are not authorized to create quiz for this course',
			});
		}

		const quiz = await Quiz.create({
			...quizData,
			courseId,
		});

		res.status(201).json({
			success: true,
			message: 'Quiz created successfully',
			data: quiz,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create quiz',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/quizzes/course/{courseId}:
 *   get:
 *     summary: Get all quizzes for a course
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: List of quizzes
 */
export const getCourseQuizzes = async (req, res) => {
	try {
		const { courseId } = req.params;

		// Check if user is enrolled
		const enrollment = await Enrollment.findOne({
			userId: req.user._id,
			courseId,
			status: 'active',
		});

		if (!enrollment) {
			return res.status(403).json({
				success: false,
				message: 'You are not enrolled in this course',
			});
		}

		const quizzes = await Quiz.find({ courseId }).sort({ createdAt: 1 });

		// Get user's attempts for these quizzes
		const quizIds = quizzes.map((q) => q._id);
		const attempts = await QuizAttempt.find({
			userId: req.user._id,
			quizId: { $in: quizIds },
		}).sort({ createdAt: -1 });

		const quizzesWithAttempts = quizzes.map((quiz) => {
			const quizAttempts = attempts.filter((a) => a.quizId.toString() === quiz._id.toString());
			const bestScore = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.score)) : 0;
			const attemptsCount = quizAttempts.length;

			return {
				...quiz.toObject(),
				attemptsCount,
				bestScore,
				canAttempt: attemptsCount < quiz.attemptsAllowed,
			};
		});

		res.status(200).json({
			success: true,
			data: quizzesWithAttempts,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch quizzes',
		});
	}
};

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *     responses:
 *       200:
 *         description: Quiz details
 */
export const getQuizById = async (req, res) => {
	try {
		const { quizId } = req.params;

		const quiz = await Quiz.findById(quizId).populate('courseId', 'title instructor');

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// Check if user is enrolled
		const enrollment = await Enrollment.findOne({
			userId: req.user._id,
			courseId: quiz.courseId._id,
			status: 'active',
		});

		if (!enrollment) {
			return res.status(403).json({
				success: false,
				message: 'You are not enrolled in this course',
			});
		}

		// Get user's attempts
		const attempts = await QuizAttempt.find({
			userId: req.user._id,
			quizId,
		}).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: {
				quiz,
				attemptsCount: attempts.length,
				canAttempt: attempts.length < quiz.attemptsAllowed,
				bestScore: attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch quiz',
		});
	}
};

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   put:
 *     summary: Update quiz (Instructor only)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Quiz updated
 */
export const updateQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;

		const quiz = await Quiz.findById(quizId).populate('courseId');

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		if (quiz.courseId.instructor.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You are not authorized to update this quiz',
			});
		}

		const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			message: 'Quiz updated successfully',
			data: updatedQuiz,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update quiz',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   delete:
 *     summary: Delete quiz (Instructor only)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *     responses:
 *       200:
 *         description: Quiz deleted
 */
export const deleteQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;

		const quiz = await Quiz.findById(quizId).populate('courseId');

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		if (quiz.courseId.instructor.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You are not authorized to delete this quiz',
			});
		}

		await Quiz.findByIdAndDelete(quizId);

		// Also delete all attempts for this quiz
		await QuizAttempt.deleteMany({ quizId });

		res.status(200).json({
			success: true,
			message: 'Quiz deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete quiz',
		});
	}
};

/**
 * @swagger
 * /api/quizzes/{quizId}/submit:
 *   post:
 *     summary: Submit quiz attempt
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       oneOf:
 *                         - type: string
 *                         - type: number
 *                         - type: array
 *               timeSpent:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz submitted
 */
export const submitQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;
		const { answers, timeSpent } = req.body;

		const quiz = await Quiz.findById(quizId);

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// Check if user is enrolled
		const enrollment = await Enrollment.findOne({
			userId: req.user._id,
			courseId: quiz.courseId,
			status: 'active',
		});

		if (!enrollment) {
			return res.status(403).json({
				success: false,
				message: 'You are not enrolled in this course',
			});
		}

		// Check attempts limit
		const attemptsCount = await QuizAttempt.countDocuments({
			userId: req.user._id,
			quizId,
		});

		if (attemptsCount >= quiz.attemptsAllowed) {
			return res.status(400).json({
				success: false,
				message: 'You have exceeded the maximum number of attempts',
			});
		}

		// Calculate score
		let score = 0;
		const processedAnswers = [];

		quiz.questions.forEach((question) => {
			const userAnswer = answers.find((a) => a.questionId === question._id.toString());

			if (!userAnswer) {
				processedAnswers.push({
					questionId: question._id,
					userAnswer: null,
					correctAnswer: question.correctAnswer,
					isCorrect: false,
				});
				return;
			}

			let isCorrect = false;

			if (question.type === 'multiple-choice' || question.type === 'true-false') {
				isCorrect = userAnswer.answer === question.correctAnswer;
			} else if (question.type === 'short-answer') {
				// Case-insensitive comparison
				isCorrect =
					userAnswer.answer?.toString().toLowerCase().trim() ===
					question.correctAnswer?.toString().toLowerCase().trim();
			}

			if (isCorrect) {
				score += question.points || 1;
			}

			processedAnswers.push({
				questionId: question._id,
				userAnswer: userAnswer.answer,
				correctAnswer: question.correctAnswer,
				isCorrect,
			});
		});

		const totalPossibleScore = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
		const percentage = (score / totalPossibleScore) * 100;
		const passed = percentage >= quiz.passingScore;

		const attempt = await QuizAttempt.create({
			userId: req.user._id,
			quizId,
			courseId: quiz.courseId,
			answers: processedAnswers,
			score,
			percentage,
			passed,
			timeSpent,
		});

		// Create notification
		await Notification.create({
			userId: req.user._id,
			type: 'quiz_completed',
			title: `Quiz ${passed ? 'Passed' : 'Failed'}`,
			message: `You ${passed ? 'passed' : 'failed'} the quiz "${quiz.title}" with ${percentage.toFixed(1)}%`,
			metadata: {
				quizId: quiz._id,
				courseId: quiz.courseId,
				score,
				percentage,
				passed,
			},
		});

		res.status(201).json({
			success: true,
			message: passed ? 'Congratulations! You passed the quiz.' : 'Unfortunately, you did not pass this time.',
			data: {
				attemptId: attempt._id,
				score,
				percentage,
				passed,
				totalQuestions: quiz.questions.length,
				correctAnswers: processedAnswers.filter((a) => a.isCorrect).length,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to submit quiz',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/quizzes/attempts/{attemptId}:
 *   get:
 *     summary: Get quiz attempt results
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *     responses:
 *       200:
 *         description: Attempt results
 */
export const getAttemptResults = async (req, res) => {
	try {
		const { attemptId } = req.params;

		const attempt = await QuizAttempt.findById(attemptId).populate('quizId').populate('courseId', 'title');

		if (!attempt) {
			return res.status(404).json({
				success: false,
				message: 'Attempt not found',
			});
		}

		if (attempt.userId.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You are not authorized to view this attempt',
			});
		}

		res.status(200).json({
			success: true,
			data: attempt,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch attempt results',
		});
	}
};

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts:
 *   get:
 *     summary: Get all attempts for a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *     responses:
 *       200:
 *         description: List of attempts
 */
export const getQuizAttempts = async (req, res) => {
	try {
		const { quizId } = req.params;

		const attempts = await QuizAttempt.find({
			userId: req.user._id,
			quizId,
		})
			.sort({ createdAt: -1 })
			.select('-answers'); // Don't show answers in list

		res.status(200).json({
			success: true,
			data: attempts,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch attempts',
		});
	}
};

export default {
	createQuiz,
	getCourseQuizzes,
	getQuizById,
	updateQuiz,
	deleteQuiz,
	submitQuiz,
	getAttemptResults,
	getQuizAttempts,
};
