import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
	role: {
		type: String,
		enum: ['user', 'assistant', 'system'],
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	metadata: {
		intent: String,
		confidence: Number,
		suggestedCourses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Course',
			},
		],
	},
});

const chatbotConversationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		sessionId: {
			type: String,
			required: true,
			unique: true,
		},
		messages: [messageSchema],
		context: {
			intent: {
				type: String,
				enum: ['course_inquiry', 'support', 'general', 'enrollment', 'technical'],
			},
			currentTopic: String,
			userInterests: [String],
			recommendedCourses: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Course',
				},
			],
		},
		leadInfo: {
			isLead: {
				type: Boolean,
				default: false,
			},
			capturedEmail: String,
			capturedPhone: String,
			interestedCourses: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Course',
				},
			],
			followUpRequired: {
				type: Boolean,
				default: false,
			},
			priority: {
				type: String,
				enum: ['low', 'medium', 'high'],
				default: 'medium',
			},
		},
		status: {
			type: String,
			enum: ['active', 'closed', 'transferred'],
			default: 'active',
		},
		transferredToAgent: {
			type: Boolean,
			default: false,
		},
		agentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		satisfaction: {
			rating: {
				type: Number,
				min: 1,
				max: 5,
			},
			feedback: String,
		},
		startedAt: {
			type: Date,
			default: Date.now,
		},
		endedAt: {
			type: Date,
		},
		metadata: {
			ip: String,
			userAgent: String,
			referrer: String,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
chatbotConversationSchema.index({ userId: 1, startedAt: -1 });
chatbotConversationSchema.index({ sessionId: 1 });
chatbotConversationSchema.index({ status: 1 });
chatbotConversationSchema.index({ 'leadInfo.isLead': 1 });

// Method to add message
chatbotConversationSchema.methods.addMessage = async function (role, content, metadata = {}) {
	this.messages.push({
		role,
		content,
		timestamp: new Date(),
		metadata,
	});
	return this.save();
};

// Method to close conversation
chatbotConversationSchema.methods.close = async function (rating, feedback) {
	this.status = 'closed';
	this.endedAt = new Date();
	if (rating) {
		this.satisfaction.rating = rating;
		this.satisfaction.feedback = feedback;
	}
	return this.save();
};

const ChatbotConversation = mongoose.model('ChatbotConversation', chatbotConversationSchema);

export default ChatbotConversation;
