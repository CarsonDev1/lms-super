import ChatbotConversation from '../models/ChatbotConversation.js';
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Start new chatbot conversation
 * @route   POST /api/chatbot/conversations
 * @access  Public
 */
export const startConversation = async (req, res) => {
	const { userId, metadata } = req.body;

	const sessionId = uuidv4();

	const conversation = await ChatbotConversation.create({
		userId: userId || req.user?._id,
		sessionId,
		messages: [
			{
				role: 'assistant',
				content:
					'Hello! Welcome to our LMS. How can I help you today? I can assist you with course recommendations, enrollment questions, or general support.',
			},
		],
		metadata: metadata || {},
	});

	res.status(201).json({
		success: true,
		data: conversation,
	});
};

/**
 * @desc    Get conversation by session ID
 * @route   GET /api/chatbot/conversations/:sessionId
 * @access  Public
 */
export const getConversation = async (req, res) => {
	const conversation = await ChatbotConversation.findOne({
		sessionId: req.params.sessionId,
	})
		.populate('recommendedCourses')
		.populate('agentId', 'name avatar');

	if (!conversation) {
		return res.status(404).json({ message: 'Conversation not found' });
	}

	res.json({
		success: true,
		data: conversation,
	});
};

/**
 * @desc    Get user's conversations
 * @route   GET /api/chatbot/conversations/user/:userId
 * @access  Private
 */
export const getUserConversations = async (req, res) => {
	const conversations = await ChatbotConversation.find({
		userId: req.params.userId,
	}).sort('-startedAt');

	res.json({
		success: true,
		count: conversations.length,
		data: conversations,
	});
};

/**
 * @desc    Send message in conversation
 * @route   POST /api/chatbot/conversations/:sessionId/messages
 * @access  Public
 */
export const sendMessage = async (req, res) => {
	const { message } = req.body;

	const conversation = await ChatbotConversation.findOne({
		sessionId: req.params.sessionId,
	});

	if (!conversation) {
		return res.status(404).json({ message: 'Conversation not found' });
	}

	// Add user message
	await conversation.addMessage('user', message);

	// Generate AI response (placeholder - integrate with actual AI service)
	const aiResponse = await generateAIResponse(message, conversation);

	// Add assistant message
	await conversation.addMessage('assistant', aiResponse.content, aiResponse.metadata);

	// Update context
	if (aiResponse.intent) {
		conversation.context.intent = aiResponse.intent;
	}
	if (aiResponse.recommendedCourses) {
		conversation.context.recommendedCourses = aiResponse.recommendedCourses;
	}

	await conversation.save();

	res.json({
		success: true,
		data: conversation,
	});
};

/**
 * @desc    Capture lead information
 * @route   POST /api/chatbot/conversations/:sessionId/capture-lead
 * @access  Public
 */
export const captureLead = async (req, res) => {
	const { email, phone, interestedCourses } = req.body;

	const conversation = await ChatbotConversation.findOne({
		sessionId: req.params.sessionId,
	});

	if (!conversation) {
		return res.status(404).json({ message: 'Conversation not found' });
	}

	conversation.leadInfo = {
		isLead: true,
		capturedEmail: email,
		capturedPhone: phone,
		interestedCourses: interestedCourses || [],
		followUpRequired: true,
		priority: 'medium',
	};

	await conversation.save();

	res.json({
		success: true,
		data: conversation,
		message: 'Lead information captured',
	});
};

/**
 * @desc    Transfer to human agent
 * @route   POST /api/chatbot/conversations/:sessionId/transfer
 * @access  Public
 */
export const transferToAgent = async (req, res) => {
	const { agentId } = req.body;

	const conversation = await ChatbotConversation.findOne({
		sessionId: req.params.sessionId,
	});

	if (!conversation) {
		return res.status(404).json({ message: 'Conversation not found' });
	}

	conversation.transferredToAgent = true;
	conversation.agentId = agentId;
	conversation.status = 'transferred';

	await conversation.addMessage('system', 'You have been transferred to a human agent. Please wait a moment.');

	await conversation.save();

	res.json({
		success: true,
		data: conversation,
		message: 'Transferred to agent',
	});
};

/**
 * @desc    Close conversation
 * @route   POST /api/chatbot/conversations/:sessionId/close
 * @access  Public
 */
export const closeConversation = async (req, res) => {
	const { rating, feedback } = req.body;

	const conversation = await ChatbotConversation.findOne({
		sessionId: req.params.sessionId,
	});

	if (!conversation) {
		return res.status(404).json({ message: 'Conversation not found' });
	}

	await conversation.close(rating, feedback);

	res.json({
		success: true,
		data: conversation,
		message: 'Conversation closed',
	});
};

/**
 * @desc    Get all conversations (Admin)
 * @route   GET /api/chatbot/conversations
 * @access  Private/Admin
 */
export const getAllConversations = async (req, res) => {
	const { status, isLead } = req.query;

	const filter = {};
	if (status) filter.status = status;
	if (isLead === 'true') filter['leadInfo.isLead'] = true;

	const conversations = await ChatbotConversation.find(filter)
		.populate('userId', 'name email')
		.populate('agentId', 'name')
		.sort('-startedAt');

	res.json({
		success: true,
		count: conversations.length,
		data: conversations,
	});
};

/**
 * @desc    Get chatbot analytics
 * @route   GET /api/chatbot/analytics
 * @access  Private/Admin
 */
export const getChatbotAnalytics = async (req, res) => {
	const totalConversations = await ChatbotConversation.countDocuments();
	const activeConversations = await ChatbotConversation.countDocuments({
		status: 'active',
	});
	const closedConversations = await ChatbotConversation.countDocuments({
		status: 'closed',
	});
	const leadsGenerated = await ChatbotConversation.countDocuments({
		'leadInfo.isLead': true,
	});

	// Average satisfaction
	const satisfactionData = await ChatbotConversation.aggregate([
		{ $match: { 'satisfaction.rating': { $exists: true } } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: '$satisfaction.rating' },
				totalRatings: { $sum: 1 },
			},
		},
	]);

	const satisfaction = satisfactionData[0] || {
		averageRating: 0,
		totalRatings: 0,
	};

	// Intent distribution
	const intentDistribution = await ChatbotConversation.aggregate([
		{ $match: { 'context.intent': { $exists: true } } },
		{ $group: { _id: '$context.intent', count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
	]);

	res.json({
		success: true,
		data: {
			conversations: {
				total: totalConversations,
				active: activeConversations,
				closed: closedConversations,
			},
			leads: {
				generated: leadsGenerated,
			},
			satisfaction,
			intentDistribution,
		},
	});
};

// Helper function to generate AI response (placeholder)
const generateAIResponse = async (message, conversation) => {
	// This is a placeholder. In production, integrate with:
	// - OpenAI GPT
	// - Anthropic Claude
	// - Custom trained model
	// - RAG system with course content

	const lowerMessage = message.toLowerCase();

	// Simple intent detection
	let intent = 'general';
	let response = "I'm here to help! Could you please provide more details?";
	let recommendedCourses = [];

	if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
		intent = 'course_inquiry';

		// Get popular courses
		const courses = await Course.find({ status: 'published' })
			.sort('-enrollmentCount')
			.limit(3)
			.select('_id title description thumbnail');

		recommendedCourses = courses.map((c) => c._id);

		response = `I'd be happy to help you find the right course! Here are some of our popular courses:\n\n${courses
			.map((c, i) => `${i + 1}. ${c.title}`)
			.join('\n')}\n\nWould you like to know more about any of these?`;
	} else if (lowerMessage.includes('enroll') || lowerMessage.includes('register')) {
		intent = 'enrollment';
		response =
			'To enroll in a course, simply browse our course catalog, select the course you want, and click "Enroll Now". If you need any assistance with the enrollment process, I\'m here to help!';
	} else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
		intent = 'course_inquiry';
		response =
			'Course prices vary depending on the content and duration. Most courses range from $49 to $199. Would you like me to show you courses in a specific price range?';
	} else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
		intent = 'support';
		response =
			'I can help you with:\n• Finding the right course\n• Enrollment process\n• Payment questions\n• Technical issues\n• General platform questions\n\nWhat would you like help with?';
	}

	return {
		content: response,
		intent,
		recommendedCourses,
		metadata: {
			intent,
			confidence: 0.8,
			suggestedCourses: recommendedCourses,
		},
	};
};

export default {
	startConversation,
	getConversation,
	getUserConversations,
	sendMessage,
	captureLead,
	transferToAgent,
	closeConversation,
	getAllConversations,
	getChatbotAnalytics,
};
