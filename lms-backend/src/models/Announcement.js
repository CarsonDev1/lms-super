import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['info', 'warning', 'success', 'error', 'maintenance', 'feature'],
			default: 'info',
		},
		priority: {
			type: String,
			enum: ['low', 'medium', 'high', 'urgent'],
			default: 'medium',
		},
		targetAudience: {
			scope: {
				type: String,
				enum: ['all', 'role', 'course', 'user'],
				default: 'all',
			},
			roles: {
				type: [String],
				enum: ['student', 'instructor', 'admin'],
				default: [],
			},
			courseIds: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Course',
				},
			],
			userIds: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
			],
		},
		displaySettings: {
			showAsPopup: {
				type: Boolean,
				default: false,
			},
			showInDashboard: {
				type: Boolean,
				default: true,
			},
			showAsNotification: {
				type: Boolean,
				default: true,
			},
			dismissible: {
				type: Boolean,
				default: true,
			},
		},
		scheduling: {
			publishAt: {
				type: Date,
				default: Date.now,
			},
			expiresAt: {
				type: Date,
			},
		},
		status: {
			type: String,
			enum: ['draft', 'scheduled', 'active', 'expired', 'archived'],
			default: 'draft',
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		stats: {
			totalViews: {
				type: Number,
				default: 0,
			},
			totalDismissals: {
				type: Number,
				default: 0,
			},
			uniqueViews: {
				type: Number,
				default: 0,
			},
		},
		actionButton: {
			text: {
				type: String,
			},
			url: {
				type: String,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
announcementSchema.index({ status: 1, 'scheduling.publishAt': -1 });
announcementSchema.index({ 'targetAudience.scope': 1 });
announcementSchema.index({ 'scheduling.expiresAt': 1 });

// Method to check if announcement is active
announcementSchema.methods.isActive = function () {
	const now = new Date();
	return (
		this.status === 'active' &&
		this.scheduling.publishAt <= now &&
		(!this.scheduling.expiresAt || this.scheduling.expiresAt > now)
	);
};

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
