import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
	date: {
		type: Date,
		required: true,
	},
	lessonIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course.curriculum',
		},
	],
	duration: {
		type: Number, // minutes
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'missed', 'rescheduled'],
		default: 'pending',
	},
	completedAt: {
		type: Date,
	},
	actualDuration: {
		type: Number, // actual minutes spent
	},
});

const studyPlanSchema = new mongoose.Schema(
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
		enrollmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Enrollment',
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
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		targetCompletionDate: {
			type: Date,
			required: true,
		},
		dailyStudyMinutes: {
			type: Number,
			required: true,
			min: 15,
			max: 480, // 8 hours max per day
		},
		studyDays: {
			type: [Number], // 0 = Sunday, 1 = Monday, etc.
			default: [1, 2, 3, 4, 5], // Weekdays
		},
		sessions: [studySessionSchema],
		currentSession: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: ['active', 'paused', 'completed', 'abandoned'],
			default: 'active',
		},
		preferences: {
			studyTimePreference: {
				type: String,
				enum: ['morning', 'afternoon', 'evening', 'night'],
				default: 'evening',
			},
			reminderEnabled: {
				type: Boolean,
				default: true,
			},
			reminderMinutesBefore: {
				type: Number,
				default: 30,
			},
		},
		stats: {
			completedSessions: {
				type: Number,
				default: 0,
			},
			missedSessions: {
				type: Number,
				default: 0,
			},
			totalStudyMinutes: {
				type: Number,
				default: 0,
			},
			averageCompletionRate: {
				type: Number,
				default: 0,
			},
			currentStreak: {
				type: Number,
				default: 0,
			},
			longestStreak: {
				type: Number,
				default: 0,
			},
		},
		metadata: {
			generatedBy: {
				type: String,
				enum: ['auto', 'manual', 'ai'],
				default: 'auto',
			},
			regenerationCount: {
				type: Number,
				default: 0,
			},
			lastRegeneratedAt: {
				type: Date,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
studyPlanSchema.index({ userId: 1, courseId: 1 });
studyPlanSchema.index({ status: 1 });
studyPlanSchema.index({ 'sessions.date': 1 });

// Virtual for progress percentage
studyPlanSchema.virtual('progressPercentage').get(function () {
	if (this.sessions.length === 0) return 0;
	const completed = this.sessions.filter((s) => s.status === 'completed').length;
	return Math.round((completed / this.sessions.length) * 100);
});

// Method to get today's session
studyPlanSchema.methods.getTodaySession = function () {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return this.sessions.find((session) => {
		const sessionDate = new Date(session.date);
		sessionDate.setHours(0, 0, 0, 0);
		return sessionDate.getTime() === today.getTime();
	});
};

// Method to mark session as completed
studyPlanSchema.methods.completeSession = async function (sessionId, actualDuration) {
	const session = this.sessions.id(sessionId);
	if (!session) throw new Error('Session not found');

	session.status = 'completed';
	session.completedAt = new Date();
	session.actualDuration = actualDuration || session.duration;

	this.stats.completedSessions += 1;
	this.stats.totalStudyMinutes += session.actualDuration;
	this.currentSession += 1;

	// Update streak
	this.updateStreak();

	// Check if plan is completed
	const allCompleted = this.sessions.every((s) => s.status === 'completed');
	if (allCompleted) {
		this.status = 'completed';
	}

	return this.save();
};

// Method to mark session as missed
studyPlanSchema.methods.markSessionMissed = async function (sessionId) {
	const session = this.sessions.id(sessionId);
	if (!session) throw new Error('Session not found');

	session.status = 'missed';
	this.stats.missedSessions += 1;
	this.updateStreak(true); // Reset streak

	return this.save();
};

// Method to reschedule session
studyPlanSchema.methods.rescheduleSession = async function (sessionId, newDate) {
	const session = this.sessions.id(sessionId);
	if (!session) throw new Error('Session not found');

	session.date = newDate;
	session.status = 'rescheduled';

	return this.save();
};

// Method to update streak
studyPlanSchema.methods.updateStreak = function (reset = false) {
	if (reset) {
		this.stats.currentStreak = 0;
	} else {
		this.stats.currentStreak += 1;
		if (this.stats.currentStreak > this.stats.longestStreak) {
			this.stats.longestStreak = this.stats.currentStreak;
		}
	}
};

// Method to regenerate plan
studyPlanSchema.methods.regenerate = async function (newParams) {
	// Reset sessions
	this.sessions = [];
	this.currentSession = 0;
	this.stats.completedSessions = 0;
	this.stats.missedSessions = 0;

	// Update parameters
	if (newParams.dailyStudyMinutes) this.dailyStudyMinutes = newParams.dailyStudyMinutes;
	if (newParams.studyDays) this.studyDays = newParams.studyDays;
	if (newParams.targetCompletionDate) this.targetCompletionDate = newParams.targetCompletionDate;

	// Update metadata
	this.metadata.regenerationCount += 1;
	this.metadata.lastRegeneratedAt = new Date();

	return this.save();
};

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);

export default StudyPlan;
