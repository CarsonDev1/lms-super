import mongoose from 'mongoose';

const roadmapLevelSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		levelNumber: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
		},
		icon: {
			type: String,
		},
		color: {
			type: String,
			default: '#4F46E5',
		},
		position: {
			x: { type: Number, default: 0 },
			y: { type: Number, default: 0 },
		},
		unlockRequirements: {
			previousLevel: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'RoadmapLevel',
			},
			minXP: {
				type: Number,
				default: 0,
			},
			minCups: {
				type: Number,
				default: 0,
			},
			requiredAchievements: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Achievement',
				},
			],
			requiredLessons: [
				{
					type: mongoose.Schema.Types.ObjectId,
				},
			],
		},
		lessons: [
			{
				lessonId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
				},
				order: {
					type: Number,
					required: true,
				},
				isRequired: {
					type: Boolean,
					default: true,
				},
			},
		],
		rewards: {
			xp: {
				type: Number,
				default: 0,
			},
			cups: {
				type: Number,
				default: 0,
			},
			badge: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Achievement',
			},
		},
		estimatedDuration: {
			type: Number, // in minutes
			default: 0,
		},
		difficulty: {
			type: String,
			enum: ['beginner', 'intermediate', 'advanced', 'expert'],
			default: 'beginner',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		stats: {
			totalStarted: {
				type: Number,
				default: 0,
			},
			totalCompleted: {
				type: Number,
				default: 0,
			},
			averageCompletionTime: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
roadmapLevelSchema.index({ courseId: 1, levelNumber: 1 });
roadmapLevelSchema.index({ courseId: 1, isActive: 1 });

// Virtual for completion rate
roadmapLevelSchema.virtual('completionRate').get(function () {
	if (this.stats.totalStarted === 0) return 0;
	return Math.round((this.stats.totalCompleted / this.stats.totalStarted) * 100);
});

const RoadmapLevel = mongoose.model('RoadmapLevel', roadmapLevelSchema);

export default RoadmapLevel;
