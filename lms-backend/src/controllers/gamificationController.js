import Achievement from '../models/Achievement.js';
import UserProgress from '../models/UserProgress.js';

/**
 * @desc    Get all achievements
 * @route   GET /api/gamification/achievements
 * @access  Public
 */
export const getAchievements = async (req, res) => {
	const { category, type, rarity } = req.query;

	const filter = { isActive: true };
	if (category) filter.category = category;
	if (type) filter.type = type;
	if (rarity) filter.rarity = rarity;

	const achievements = await Achievement.find(filter).sort('order');

	res.json({
		success: true,
		count: achievements.length,
		data: achievements,
	});
};

/**
 * @desc    Get achievement by ID
 * @route   GET /api/gamification/achievements/:id
 * @access  Public
 */
export const getAchievementById = async (req, res) => {
	const achievement = await Achievement.findById(req.params.id);

	if (!achievement) {
		return res.status(404).json({ message: 'Achievement not found' });
	}

	res.json({
		success: true,
		data: achievement,
	});
};

/**
 * @desc    Create achievement (Admin only)
 * @route   POST /api/gamification/achievements
 * @access  Private/Admin
 */
export const createAchievement = async (req, res) => {
	const achievement = await Achievement.create(req.body);

	res.status(201).json({
		success: true,
		data: achievement,
	});
};

/**
 * @desc    Update achievement (Admin only)
 * @route   PUT /api/gamification/achievements/:id
 * @access  Private/Admin
 */
export const updateAchievement = async (req, res) => {
	const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!achievement) {
		return res.status(404).json({ message: 'Achievement not found' });
	}

	res.json({
		success: true,
		data: achievement,
	});
};

/**
 * @desc    Delete achievement (Admin only)
 * @route   DELETE /api/gamification/achievements/:id
 * @access  Private/Admin
 */
export const deleteAchievement = async (req, res) => {
	const achievement = await Achievement.findByIdAndDelete(req.params.id);

	if (!achievement) {
		return res.status(404).json({ message: 'Achievement not found' });
	}

	res.json({
		success: true,
		message: 'Achievement deleted',
	});
};

/**
 * @desc    Get user progress
 * @route   GET /api/gamification/progress
 * @access  Private
 */
export const getUserProgress = async (req, res) => {
	let progress = await UserProgress.findOne({ userId: req.user._id }).populate('achievements.achievementId');

	// Create if doesn't exist
	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	} else {
		// Reset daily progress if needed
		await progress.resetDailyProgress();
	}

	res.json({
		success: true,
		data: progress,
	});
};

/**
 * @desc    Get user progress by user ID (for leaderboard)
 * @route   GET /api/gamification/progress/:userId
 * @access  Public
 */
export const getUserProgressById = async (req, res) => {
	const progress = await UserProgress.findOne({ userId: req.params.userId })
		.populate('userId', 'name avatar')
		.populate('achievements.achievementId');

	if (!progress) {
		return res.status(404).json({ message: 'User progress not found' });
	}

	res.json({
		success: true,
		data: progress,
	});
};

/**
 * @desc    Add XP to user
 * @route   POST /api/gamification/progress/add-xp
 * @access  Private
 */
export const addXP = async (req, res) => {
	const { amount, source } = req.body;

	let progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	}

	const oldLevel = progress.level;
	await progress.addXP(amount, source);
	const leveledUp = progress.level > oldLevel;

	res.json({
		success: true,
		data: progress,
		leveledUp,
		message: leveledUp ? `Congratulations! You've reached level ${progress.level}!` : `+${amount} XP earned`,
	});
};

/**
 * @desc    Add cups to user
 * @route   POST /api/gamification/progress/add-cups
 * @access  Private
 */
export const addCups = async (req, res) => {
	const { amount } = req.body;

	let progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	}

	await progress.addCups(amount);

	res.json({
		success: true,
		data: progress,
		message: `+${amount} cups earned`,
	});
};

/**
 * @desc    Unlock achievement for user
 * @route   POST /api/gamification/progress/unlock-achievement
 * @access  Private
 */
export const unlockAchievement = async (req, res) => {
	const { achievementId } = req.body;

	const achievement = await Achievement.findById(achievementId);
	if (!achievement) {
		return res.status(404).json({ message: 'Achievement not found' });
	}

	let progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	}

	// Check if already unlocked
	const alreadyUnlocked = progress.achievements.some((a) => a.achievementId.toString() === achievementId);

	if (alreadyUnlocked) {
		return res.status(400).json({ message: 'Achievement already unlocked' });
	}

	await progress.unlockAchievement(achievementId);

	// Award XP and cups
	if (achievement.xpReward > 0) {
		await progress.addXP(achievement.xpReward, 'achievement');
	}
	if (achievement.cupsReward > 0) {
		await progress.addCups(achievement.cupsReward);
	}

	// Update achievement stats
	achievement.stats.totalUnlocked += 1;
	await achievement.save();

	res.json({
		success: true,
		data: progress,
		achievement,
		message: `Achievement "${achievement.name}" unlocked!`,
	});
};

/**
 * @desc    Update daily goals
 * @route   PUT /api/gamification/progress/daily-goals
 * @access  Private
 */
export const updateDailyGoals = async (req, res) => {
	const { xpGoal, minutesGoal, lessonsGoal } = req.body;

	let progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	}

	if (xpGoal) progress.dailyGoals.xpGoal = xpGoal;
	if (minutesGoal) progress.dailyGoals.minutesGoal = minutesGoal;
	if (lessonsGoal) progress.dailyGoals.lessonsGoal = lessonsGoal;

	await progress.save();

	res.json({
		success: true,
		data: progress,
	});
};

/**
 * @desc    Update streak
 * @route   POST /api/gamification/progress/update-streak
 * @access  Private
 */
export const updateStreak = async (req, res) => {
	let progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		progress = await UserProgress.create({ userId: req.user._id });
	}

	await progress.updateStreak();

	res.json({
		success: true,
		data: progress,
		message: `Streak: ${progress.currentStreak} days!`,
	});
};

/**
 * @desc    Get leaderboard
 * @route   GET /api/gamification/leaderboard
 * @access  Public
 */
export const getLeaderboard = async (req, res) => {
	const { type = 'xp', limit = 100 } = req.query;

	const sortField = type === 'xp' ? '-xp' : type === 'cups' ? '-cups' : '-currentStreak';

	const leaderboard = await UserProgress.find()
		.populate('userId', 'name avatar')
		.sort(sortField)
		.limit(parseInt(limit));

	res.json({
		success: true,
		count: leaderboard.length,
		data: leaderboard,
	});
};

/**
 * @desc    Get user ranking
 * @route   GET /api/gamification/progress/ranking
 * @access  Private
 */
export const getUserRanking = async (req, res) => {
	const progress = await UserProgress.findOne({ userId: req.user._id });

	if (!progress) {
		return res.json({
			success: true,
			data: {
				global: null,
				weekly: null,
				monthly: null,
			},
		});
	}

	// Calculate global ranking
	const globalRank = (await UserProgress.countDocuments({ xp: { $gt: progress.xp } })) + 1;

	res.json({
		success: true,
		data: {
			global: globalRank,
			xp: progress.xp,
			level: progress.level,
			cups: progress.cups,
			streak: progress.currentStreak,
		},
	});
};

export default {
	getAchievements,
	getAchievementById,
	createAchievement,
	updateAchievement,
	deleteAchievement,
	getUserProgress,
	getUserProgressById,
	addXP,
	addCups,
	unlockAchievement,
	updateDailyGoals,
	updateStreak,
	getLeaderboard,
	getUserRanking,
};
