import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
		lessonId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null, // null for course-level comments
		},
		content: {
			type: String,
			required: [true, 'Comment content is required'],
			maxlength: [2000, 'Comment cannot exceed 2000 characters'],
			trim: true,
		},
		parentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
			default: null, // null for top-level comments
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		mentions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: Date,
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: Date,
		isPinned: {
			type: Boolean,
			default: false,
		},
		replyCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
commentSchema.index({ courseId: 1, createdAt: -1 });
commentSchema.index({ lessonId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ isDeleted: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function () {
	return this.likes.length;
});

// Update reply count when a reply is added
commentSchema.statics.incrementReplyCount = async function (parentId) {
	await this.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
};

commentSchema.statics.decrementReplyCount = async function (parentId) {
	await this.findByIdAndUpdate(parentId, { $inc: { replyCount: -1 } });
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
