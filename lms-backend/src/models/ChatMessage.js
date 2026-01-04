import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
	{
		roomId: {
			type: String,
			required: true,
			index: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		message: {
			type: String,
			required: true,
			maxlength: 5000,
			trim: true,
		},
		messageType: {
			type: String,
			enum: ['text', 'image', 'file', 'system'],
			default: 'text',
		},
		attachments: [
			{
				url: String,
				type: String,
				name: String,
				size: Number,
			},
		],
		isRead: {
			type: Boolean,
			default: false,
		},
		readAt: Date,
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
	},
	{
		timestamps: true,
	}
);

// Indexes
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ receiverId: 1 });
chatMessageSchema.index({ isRead: 1 });

// Generate roomId from two user IDs
chatMessageSchema.statics.generateRoomId = function (userId1, userId2) {
	const ids = [userId1.toString(), userId2.toString()].sort();
	return `room_${ids[0]}_${ids[1]}`;
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
