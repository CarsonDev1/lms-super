import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['badge', 'trophy', 'milestone', 'special'],
			default: 'badge',
		},
		category: {
			type: String,
			enum: ['learning', 'social', 'streak', 'completion', 'speed', 'perfection'],
			required: true,
		},
		icon: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			default: '#FFD700',
		},
		rarity: {
			type: String,
			enum: ['common', 'rare', 'epic', 'legendary'],
			default: 'common',
		},
		xpReward: {
			type: Number,
			default: 0,
		},
		cupsReward: {
			type: Number,
			default: 0,
		},
		requirements: {
			// For flexible achievement criteria
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isSecret: {
			type: Boolean,
			default: false,
		},
		order: {
			type: Number,
			default: 0,
		},
		stats: {
			totalUnlocked: {
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
achievementSchema.index({ code: 1 });
achievementSchema.index({ type: 1, category: 1 });
achievementSchema.index({ isActive: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
