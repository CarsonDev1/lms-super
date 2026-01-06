import mongoose from 'mongoose';

const userRoadmapProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		currentLevel: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'RoadmapLevel',
		},
		unlockedLevels: [
			{
				levelId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'RoadmapLevel',
				},
				unlockedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		completedLevels: [
			{
				levelId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'RoadmapLevel',
				},
				completedAt: {
					type: Date,
					default: Date.now,
				},
				score: {
					type: Number,
					default: 0,
				},
				timeTaken: {
					type: Number, // minutes
					default: 0,
				},
			},
		],
		levelProgress: [
			{
				levelId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'RoadmapLevel',
				},
				completedLessons: [
					{
						type: mongoose.Schema.Types.ObjectId,
					},
				],
				totalLessons: {
					type: Number,
					default: 0,
				},
				progressPercentage: {
					type: Number,
					default: 0,
				},
				startedAt: {
					type: Date,
				},
			},
		],
		totalXpEarned: {
			type: Number,
			default: 0,
		},
		totalCupsEarned: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
userRoadmapProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userRoadmapProgressSchema.index({ userId: 1 });

// Method to unlock level
userRoadmapProgressSchema.methods.unlockLevel = async function (levelId) {
	const exists = this.unlockedLevels.some((l) => l.levelId.toString() === levelId.toString());

	if (!exists) {
		this.unlockedLevels.push({
			levelId,
			unlockedAt: new Date(),
		});

		this.currentLevel = levelId;
	}

	return this.save();
};

// Method to complete level
userRoadmapProgressSchema.methods.completeLevel = async function (levelId, score, timeTaken) {
	const exists = this.completedLevels.some((l) => l.levelId.toString() === levelId.toString());

	if (!exists) {
		this.completedLevels.push({
			levelId,
			completedAt: new Date(),
			score,
			timeTaken,
		});
	}

	return this.save();
};

// Method to update level progress
userRoadmapProgressSchema.methods.updateLevelProgress = async function (levelId, completedLessonId, totalLessons) {
	let progress = this.levelProgress.find((p) => p.levelId.toString() === levelId.toString());

	if (!progress) {
		progress = {
			levelId,
			completedLessons: [],
			totalLessons,
			progressPercentage: 0,
			startedAt: new Date(),
		};
		this.levelProgress.push(progress);
	}

	if (!progress.completedLessons.includes(completedLessonId)) {
		progress.completedLessons.push(completedLessonId);
	}

	progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);

	return this.save();
};

const UserRoadmapProgress = mongoose.model('UserRoadmapProgress', userRoadmapProgressSchema);

export default UserRoadmapProgress;
