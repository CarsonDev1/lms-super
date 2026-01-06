import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		level: {
			type: Number,
			default: 1,
			min: 1,
		},
		xp: {
			type: Number,
			default: 0,
			min: 0,
		},
		xpToNextLevel: {
			type: Number,
			default: 100,
		},
		totalXpEarned: {
			type: Number,
			default: 0,
		},
		cups: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalCupsEarned: {
			type: Number,
			default: 0,
		},
		achievements: [
			{
				achievementId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Achievement',
				},
				unlockedAt: {
					type: Date,
					default: Date.now,
				},
				progress: {
					type: Number,
					default: 100,
				},
			},
		],
		currentStreak: {
			type: Number,
			default: 0,
		},
		longestStreak: {
			type: Number,
			default: 0,
		},
		lastActivityDate: {
			type: Date,
		},
		streakFreezeUsed: {
			type: Number,
			default: 0,
		},
		dailyGoals: {
			xpGoal: {
				type: Number,
				default: 50,
			},
			minutesGoal: {
				type: Number,
				default: 30,
			},
			lessonsGoal: {
				type: Number,
				default: 3,
			},
		},
		todayProgress: {
			xpEarned: {
				type: Number,
				default: 0,
			},
			minutesStudied: {
				type: Number,
				default: 0,
			},
			lessonsCompleted: {
				type: Number,
				default: 0,
			},
			lastResetDate: {
				type: Date,
				default: Date.now,
			},
		},
		stats: {
			totalLearningMinutes: {
				type: Number,
				default: 0,
			},
			totalLessonsCompleted: {
				type: Number,
				default: 0,
			},
			totalCoursesCompleted: {
				type: Number,
				default: 0,
			},
			totalQuizzesPassed: {
				type: Number,
				default: 0,
			},
			averageQuizScore: {
				type: Number,
				default: 0,
			},
			perfectQuizzes: {
				type: Number,
				default: 0,
			},
		},
		rankings: {
			global: {
				type: Number,
				default: null,
			},
			weekly: {
				type: Number,
				default: null,
			},
			monthly: {
				type: Number,
				default: null,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ xp: -1 });
userProgressSchema.index({ cups: -1 });
userProgressSchema.index({ currentStreak: -1 });

// Virtual for daily goals completion percentage
userProgressSchema.virtual('dailyGoalsProgress').get(function () {
	const { xpEarned, minutesStudied, lessonsCompleted } = this.todayProgress;
	const { xpGoal, minutesGoal, lessonsGoal } = this.dailyGoals;

	return {
		xp: Math.min((xpEarned / xpGoal) * 100, 100),
		minutes: Math.min((minutesStudied / minutesGoal) * 100, 100),
		lessons: Math.min((lessonsCompleted / lessonsGoal) * 100, 100),
	};
});

// Method to add XP
userProgressSchema.methods.addXP = async function (amount, source = 'general') {
	this.xp += amount;
	this.totalXpEarned += amount;
	this.todayProgress.xpEarned += amount;

	// Level up logic
	while (this.xp >= this.xpToNextLevel) {
		this.xp -= this.xpToNextLevel;
		this.level += 1;
		this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5); // Exponential growth
	}

	return this.save();
};

// Method to add cups
userProgressSchema.methods.addCups = async function (amount) {
	this.cups += amount;
	this.totalCupsEarned += amount;
	return this.save();
};

// Method to unlock achievement
userProgressSchema.methods.unlockAchievement = async function (achievementId) {
	const exists = this.achievements.some((a) => a.achievementId.toString() === achievementId.toString());

	if (!exists) {
		this.achievements.push({
			achievementId,
			unlockedAt: new Date(),
			progress: 100,
		});
		return this.save();
	}
	return this;
};

// Method to update streak
userProgressSchema.methods.updateStreak = async function () {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const lastActivity = this.lastActivityDate ? new Date(this.lastActivityDate) : null;
	if (lastActivity) {
		lastActivity.setHours(0, 0, 0, 0);
		const dayDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

		if (dayDiff === 0) {
			// Same day, no change
			return this;
		} else if (dayDiff === 1) {
			// Consecutive day
			this.currentStreak += 1;
			if (this.currentStreak > this.longestStreak) {
				this.longestStreak = this.currentStreak;
			}
		} else {
			// Streak broken
			this.currentStreak = 1;
		}
	} else {
		this.currentStreak = 1;
	}

	this.lastActivityDate = new Date();
	return this.save();
};

// Method to reset daily progress
userProgressSchema.methods.resetDailyProgress = async function () {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const lastReset = new Date(this.todayProgress.lastResetDate);
	lastReset.setHours(0, 0, 0, 0);

	if (today > lastReset) {
		this.todayProgress = {
			xpEarned: 0,
			minutesStudied: 0,
			lessonsCompleted: 0,
			lastResetDate: new Date(),
		};
		return this.save();
	}
	return this;
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
