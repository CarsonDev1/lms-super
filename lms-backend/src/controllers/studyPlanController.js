import StudyPlan from '../models/StudyPlan.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

/**
 * @desc    Generate study plan for enrollment
 * @route   POST /api/study-plans/generate
 * @access  Private
 */
export const generateStudyPlan = async (req, res) => {
	const { enrollmentId, dailyStudyMinutes, studyDays, targetCompletionDate, preferences } = req.body;

	const enrollment = await Enrollment.findById(enrollmentId).populate('courseId');

	if (!enrollment) {
		return res.status(404).json({ message: 'Enrollment not found' });
	}

	if (enrollment.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	const course = await Course.findById(enrollment.courseId);

	// Calculate sessions based on curriculum
	const sessions = await generateSessions(course.curriculum, dailyStudyMinutes, studyDays, targetCompletionDate);

	const studyPlan = await StudyPlan.create({
		userId: req.user._id,
		courseId: course._id,
		enrollmentId,
		title: `Study Plan for ${course.title}`,
		description: `Personalized study plan to complete ${course.title}`,
		startDate: new Date(),
		endDate: targetCompletionDate,
		targetCompletionDate,
		dailyStudyMinutes,
		studyDays: studyDays || [1, 2, 3, 4, 5],
		sessions,
		preferences: preferences || {},
		metadata: {
			generatedBy: 'auto',
		},
	});

	res.status(201).json({
		success: true,
		data: studyPlan,
	});
};

/**
 * @desc    Get user's study plans
 * @route   GET /api/study-plans
 * @access  Private
 */
export const getStudyPlans = async (req, res) => {
	const { status, courseId } = req.query;

	const filter = { userId: req.user._id };
	if (status) filter.status = status;
	if (courseId) filter.courseId = courseId;

	const studyPlans = await StudyPlan.find(filter).populate('courseId', 'title thumbnail').sort('-createdAt');

	res.json({
		success: true,
		count: studyPlans.length,
		data: studyPlans,
	});
};

/**
 * @desc    Get study plan by ID
 * @route   GET /api/study-plans/:id
 * @access  Private
 */
export const getStudyPlanById = async (req, res) => {
	const studyPlan = await StudyPlan.findById(req.params.id).populate('courseId').populate('enrollmentId');

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	res.json({
		success: true,
		data: studyPlan,
	});
};

/**
 * @desc    Get today's session
 * @route   GET /api/study-plans/:id/today
 * @access  Private
 */
export const getTodaySession = async (req, res) => {
	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	const todaySession = studyPlan.getTodaySession();

	res.json({
		success: true,
		data: todaySession || null,
	});
};

/**
 * @desc    Complete a session
 * @route   PUT /api/study-plans/:id/sessions/:sessionId/complete
 * @access  Private
 */
export const completeSession = async (req, res) => {
	const { actualDuration } = req.body;

	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	await studyPlan.completeSession(req.params.sessionId, actualDuration);

	res.json({
		success: true,
		data: studyPlan,
		message: 'Session completed successfully',
	});
};

/**
 * @desc    Mark session as missed
 * @route   PUT /api/study-plans/:id/sessions/:sessionId/missed
 * @access  Private
 */
export const markSessionMissed = async (req, res) => {
	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	await studyPlan.markSessionMissed(req.params.sessionId);

	res.json({
		success: true,
		data: studyPlan,
		message: 'Session marked as missed',
	});
};

/**
 * @desc    Reschedule a session
 * @route   PUT /api/study-plans/:id/sessions/:sessionId/reschedule
 * @access  Private
 */
export const rescheduleSession = async (req, res) => {
	const { newDate } = req.body;

	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	await studyPlan.rescheduleSession(req.params.sessionId, newDate);

	res.json({
		success: true,
		data: studyPlan,
		message: 'Session rescheduled successfully',
	});
};

/**
 * @desc    Regenerate study plan
 * @route   POST /api/study-plans/:id/regenerate
 * @access  Private
 */
export const regenerateStudyPlan = async (req, res) => {
	const { dailyStudyMinutes, studyDays, targetCompletionDate } = req.body;

	const studyPlan = await StudyPlan.findById(req.params.id).populate('courseId');

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	// Generate new sessions
	const newSessions = await generateSessions(
		studyPlan.courseId.curriculum,
		dailyStudyMinutes || studyPlan.dailyStudyMinutes,
		studyDays || studyPlan.studyDays,
		targetCompletionDate || studyPlan.targetCompletionDate
	);

	await studyPlan.regenerate({
		dailyStudyMinutes,
		studyDays,
		targetCompletionDate,
	});

	studyPlan.sessions = newSessions;
	await studyPlan.save();

	res.json({
		success: true,
		data: studyPlan,
		message: 'Study plan regenerated successfully',
	});
};

/**
 * @desc    Update study plan preferences
 * @route   PUT /api/study-plans/:id/preferences
 * @access  Private
 */
export const updatePreferences = async (req, res) => {
	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	studyPlan.preferences = {
		...studyPlan.preferences,
		...req.body,
	};

	await studyPlan.save();

	res.json({
		success: true,
		data: studyPlan,
	});
};

/**
 * @desc    Delete study plan
 * @route   DELETE /api/study-plans/:id
 * @access  Private
 */
export const deleteStudyPlan = async (req, res) => {
	const studyPlan = await StudyPlan.findById(req.params.id);

	if (!studyPlan) {
		return res.status(404).json({ message: 'Study plan not found' });
	}

	if (studyPlan.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	await studyPlan.deleteOne();

	res.json({
		success: true,
		message: 'Study plan deleted successfully',
	});
};

// Helper function to generate sessions
const generateSessions = async (curriculum, dailyMinutes, studyDays, targetDate) => {
	const sessions = [];
	const lessons = [];

	// Flatten curriculum to get all lessons
	curriculum.forEach((section) => {
		section.lessons?.forEach((lesson) => {
			lessons.push({
				lessonId: lesson._id,
				duration: lesson.duration || 30,
			});
		});
	});

	// Calculate total duration
	const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);

	// Calculate number of sessions needed
	const sessionsNeeded = Math.ceil(totalDuration / dailyMinutes);

	// Generate sessions based on study days
	let currentDate = new Date();
	let lessonIndex = 0;

	for (let i = 0; i < sessionsNeeded && lessonIndex < lessons.length; i++) {
		// Find next valid study day
		while (!studyDays.includes(currentDate.getDay())) {
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Collect lessons for this session
		const sessionLessons = [];
		let sessionDuration = 0;

		while (sessionDuration < dailyMinutes && lessonIndex < lessons.length) {
			const lesson = lessons[lessonIndex];
			sessionLessons.push(lesson.lessonId);
			sessionDuration += lesson.duration;
			lessonIndex++;
		}

		sessions.push({
			date: new Date(currentDate),
			lessonIds: sessionLessons,
			duration: sessionDuration,
			status: 'pending',
		});

		currentDate.setDate(currentDate.getDate() + 1);
	}

	return sessions;
};

export default {
	generateStudyPlan,
	getStudyPlans,
	getStudyPlanById,
	getTodaySession,
	completeSession,
	markSessionMissed,
	rescheduleSession,
	regenerateStudyPlan,
	updatePreferences,
	deleteStudyPlan,
};
