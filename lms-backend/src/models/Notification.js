import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: [
				'comment',
				'reply',
				'mention',
				'like',
				'enrollment',
				'course_published',
				'course_updated',
				'announcement',
				'payment_success',
				'payment_failed',
				'certificate_issued',
				'course_approved',
				'course_rejected',
				'new_student',
				'system',
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
			maxlength: 200,
		},
		message: {
			type: String,
			required: true,
			maxlength: 500,
		},
		link: String,
		metadata: {
			courseId: mongoose.Schema.Types.ObjectId,
			commentId: mongoose.Schema.Types.ObjectId,
			orderId: mongoose.Schema.Types.ObjectId,
			userId: mongoose.Schema.Types.ObjectId,
			extra: mongoose.Schema.Types.Mixed,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		readAt: Date,
		priority: {
			type: String,
			enum: ['low', 'normal', 'high', 'urgent'],
			default: 'normal',
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Mark as read
notificationSchema.methods.markAsRead = async function () {
	this.isRead = true;
	this.readAt = new Date();
	await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
