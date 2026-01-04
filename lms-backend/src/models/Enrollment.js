import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
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
		progress: [
			{
				lessonId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
				},
				completed: {
					type: Boolean,
					default: false,
				},
				watchTime: {
					type: Number,
					default: 0, // in seconds
				},
				lastWatched: {
					type: Date,
					default: Date.now,
				},
			},
		],
		completionPercentage: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
		},
		certificateIssued: {
			type: Boolean,
			default: false,
		},
		certificateUrl: String,
		completedAt: Date,
		enrolledAt: {
			type: Date,
			default: Date.now,
		},
		lastAccessedAt: {
			type: Date,
			default: Date.now,
		},
		notes: [
			{
				lessonId: mongoose.Schema.Types.ObjectId,
				content: String,
				timestamp: Number, // video timestamp in seconds
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		bookmarks: [
			{
				lessonId: mongoose.Schema.Types.ObjectId,
				timestamp: Number,
				title: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Compound index for user and course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ completionPercentage: 1 });

// Update completion percentage
enrollmentSchema.methods.updateProgress = async function (totalLessons) {
	const completedLessons = this.progress.filter((p) => p.completed).length;
	this.completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

	if (this.completionPercentage === 100 && !this.completedAt) {
		this.completedAt = new Date();
	}

	await this.save();
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
