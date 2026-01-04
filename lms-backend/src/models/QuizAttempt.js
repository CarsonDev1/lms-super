import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		quizId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Quiz',
			required: true,
		},
		answers: [
			{
				questionId: mongoose.Schema.Types.ObjectId,
				answer: String,
				isCorrect: Boolean,
				points: Number,
			},
		],
		score: {
			type: Number,
			default: 0,
		},
		totalPoints: {
			type: Number,
			required: true,
		},
		percentage: {
			type: Number,
			default: 0,
		},
		passed: {
			type: Boolean,
			default: false,
		},
		timeSpent: {
			type: Number,
			default: 0, // in seconds
		},
		startedAt: {
			type: Date,
			default: Date.now,
		},
		completedAt: Date,
	},
	{
		timestamps: true,
	}
);

// Indexes
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ quizId: 1, score: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
