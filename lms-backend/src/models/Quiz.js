import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		lessonId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null, // null for course-level quizzes
		},
		title: {
			type: String,
			required: [true, 'Quiz title is required'],
			trim: true,
			maxlength: 200,
		},
		description: String,
		questions: [
			{
				question: {
					type: String,
					required: true,
				},
				type: {
					type: String,
					enum: ['multiple-choice', 'true-false', 'short-answer'],
					default: 'multiple-choice',
				},
				options: [String], // For multiple-choice
				correctAnswer: String, // Answer or option index
				explanation: String,
				points: {
					type: Number,
					default: 1,
				},
			},
		],
		passingScore: {
			type: Number,
			default: 70, // percentage
			min: 0,
			max: 100,
		},
		timeLimit: {
			type: Number,
			default: null, // minutes, null for no limit
		},
		attempts: {
			type: Number,
			default: null, // null for unlimited
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
quizSchema.index({ courseId: 1 });
quizSchema.index({ lessonId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
