import RoadmapLevel from '../models/RoadmapLevel.js';
import UserRoadmapProgress from '../models/UserRoadmapProgress.js';
import Course from '../models/Course.js';

/**
 * @desc    Get roadmap levels for course
 * @route   GET /api/roadmap/courses/:courseId/levels
 * @access  Public
 */
export const getRoadmapLevels = async (req, res) => {
	const levels = await RoadmapLevel.find({
		courseId: req.params.courseId,
		isActive: true,
	})
		.sort('levelNumber')
		.populate('unlockRequirements.requiredAchievements');

	res.json({
		success: true,
		count: levels.length,
		data: levels,
	});
};

/**
 * @desc    Get roadmap level by ID
 * @route   GET /api/roadmap/levels/:id
 * @access  Public
 */
export const getRoadmapLevelById = async (req, res) => {
	const level = await RoadmapLevel.findById(req.params.id)
		.populate('courseId')
		.populate('unlockRequirements.previousLevel')
		.populate('unlockRequirements.requiredAchievements')
		.populate('rewards.badge');

	if (!level) {
		return res.status(404).json({ message: 'Roadmap level not found' });
	}

	res.json({
		success: true,
		data: level,
	});
};

/**
 * @desc    Create roadmap level (Admin/Instructor)
 * @route   POST /api/roadmap/levels
 * @access  Private/Admin
 */
export const createRoadmapLevel = async (req, res) => {
	const level = await RoadmapLevel.create(req.body);

	res.status(201).json({
		success: true,
		data: level,
	});
};

/**
 * @desc    Update roadmap level (Admin/Instructor)
 * @route   PUT /api/roadmap/levels/:id
 * @access  Private/Admin
 */
export const updateRoadmapLevel = async (req, res) => {
	const level = await RoadmapLevel.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!level) {
		return res.status(404).json({ message: 'Roadmap level not found' });
	}

	res.json({
		success: true,
		data: level,
	});
};

/**
 * @desc    Delete roadmap level (Admin/Instructor)
 * @route   DELETE /api/roadmap/levels/:id
 * @access  Private/Admin
 */
export const deleteRoadmapLevel = async (req, res) => {
	const level = await RoadmapLevel.findByIdAndDelete(req.params.id);

	if (!level) {
		return res.status(404).json({ message: 'Roadmap level not found' });
	}

	res.json({
		success: true,
		message: 'Roadmap level deleted',
	});
};

/**
 * @desc    Get user's roadmap progress
 * @route   GET /api/roadmap/progress/courses/:courseId
 * @access  Private
 */
export const getUserRoadmapProgress = async (req, res) => {
	let progress = await UserRoadmapProgress.findOne({
		userId: req.user._id,
		courseId: req.params.courseId,
	})
		.populate('currentLevel')
		.populate('unlockedLevels.levelId')
		.populate('completedLevels.levelId')
		.populate('levelProgress.levelId');

	if (!progress) {
		// Create initial progress
		progress = await UserRoadmapProgress.create({
			userId: req.user._id,
			courseId: req.params.courseId,
		});

		// Unlock first level
		const firstLevel = await RoadmapLevel.findOne({
			courseId: req.params.courseId,
			levelNumber: 1,
		});

		if (firstLevel) {
			await progress.unlockLevel(firstLevel._id);
		}
	}

	res.json({
		success: true,
		data: progress,
	});
};

/**
 * @desc    Check if level is unlocked
 * @route   GET /api/roadmap/progress/levels/:levelId/check-unlock
 * @access  Private
 */
export const checkLevelUnlock = async (req, res) => {
	const level = await RoadmapLevel.findById(req.params.levelId);

	if (!level) {
		return res.status(404).json({ message: 'Level not found' });
	}

	const progress = await UserRoadmapProgress.findOne({
		userId: req.user._id,
		courseId: level.courseId,
	});

	if (!progress) {
		return res.json({
			success: true,
			unlocked: false,
			reason: 'No progress found',
		});
	}

	// Check if already unlocked
	const isUnlocked = progress.unlockedLevels.some((l) => l.levelId.toString() === level._id.toString());

	if (isUnlocked) {
		return res.json({
			success: true,
			unlocked: true,
		});
	}

	// Check requirements
	const requirements = level.unlockRequirements;
	const reasons = [];

	// Check previous level
	if (requirements.previousLevel) {
		const previousCompleted = progress.completedLevels.some(
			(l) => l.levelId.toString() === requirements.previousLevel.toString()
		);
		if (!previousCompleted) {
			reasons.push('Previous level not completed');
		}
	}

	// Check XP
	if (requirements.minXP && progress.totalXpEarned < requirements.minXP) {
		reasons.push(`Need ${requirements.minXP} XP (current: ${progress.totalXpEarned})`);
	}

	// Check Cups
	if (requirements.minCups && progress.totalCupsEarned < requirements.minCups) {
		reasons.push(`Need ${requirements.minCups} cups (current: ${progress.totalCupsEarned})`);
	}

	const unlocked = reasons.length === 0;

	res.json({
		success: true,
		unlocked,
		reasons,
	});
};

/**
 * @desc    Unlock level
 * @route   POST /api/roadmap/progress/levels/:levelId/unlock
 * @access  Private
 */
export const unlockLevel = async (req, res) => {
	const level = await RoadmapLevel.findById(req.params.levelId);

	if (!level) {
		return res.status(404).json({ message: 'Level not found' });
	}

	let progress = await UserRoadmapProgress.findOne({
		userId: req.user._id,
		courseId: level.courseId,
	});

	if (!progress) {
		progress = await UserRoadmapProgress.create({
			userId: req.user._id,
			courseId: level.courseId,
		});
	}

	// Check if meets requirements (simplified)
	await progress.unlockLevel(level._id);

	// Update level stats
	level.stats.totalStarted += 1;
	await level.save();

	res.json({
		success: true,
		data: progress,
		message: 'Level unlocked!',
	});
};

/**
 * @desc    Complete level
 * @route   POST /api/roadmap/progress/levels/:levelId/complete
 * @access  Private
 */
export const completeLevel = async (req, res) => {
	const { score, timeTaken } = req.body;

	const level = await RoadmapLevel.findById(req.params.levelId).populate('rewards.badge');

	if (!level) {
		return res.status(404).json({ message: 'Level not found' });
	}

	const progress = await UserRoadmapProgress.findOne({
		userId: req.user._id,
		courseId: level.courseId,
	});

	if (!progress) {
		return res.status(404).json({ message: 'Progress not found' });
	}

	await progress.completeLevel(level._id, score, timeTaken);

	// Award rewards
	if (level.rewards.xp) {
		progress.totalXpEarned += level.rewards.xp;
	}
	if (level.rewards.cups) {
		progress.totalCupsEarned += level.rewards.cups;
	}
	await progress.save();

	// Update level stats
	level.stats.totalCompleted += 1;
	if (level.stats.totalCompleted > 0) {
		level.stats.averageCompletionTime =
			(level.stats.averageCompletionTime * (level.stats.totalCompleted - 1) + timeTaken) /
			level.stats.totalCompleted;
	}
	await level.save();

	res.json({
		success: true,
		data: progress,
		rewards: level.rewards,
		message: 'Level completed!',
	});
};

/**
 * @desc    Update lesson progress in level
 * @route   POST /api/roadmap/progress/levels/:levelId/lessons/:lessonId
 * @access  Private
 */
export const updateLessonProgress = async (req, res) => {
	const level = await RoadmapLevel.findById(req.params.levelId);

	if (!level) {
		return res.status(404).json({ message: 'Level not found' });
	}

	let progress = await UserRoadmapProgress.findOne({
		userId: req.user._id,
		courseId: level.courseId,
	});

	if (!progress) {
		return res.status(404).json({ message: 'Progress not found' });
	}

	await progress.updateLevelProgress(level._id, req.params.lessonId, level.lessons.length);

	res.json({
		success: true,
		data: progress,
	});
};

export default {
	getRoadmapLevels,
	getRoadmapLevelById,
	createRoadmapLevel,
	updateRoadmapLevel,
	deleteRoadmapLevel,
	getUserRoadmapProgress,
	checkLevelUnlock,
	unlockLevel,
	completeLevel,
	updateLessonProgress,
};
