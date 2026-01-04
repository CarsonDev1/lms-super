import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
		rating: {
			type: Number,
			required: [true, 'Rating is required'],
			min: [1, 'Rating must be at least 1'],
			max: [5, 'Rating cannot exceed 5'],
		},
		review: {
			type: String,
			trim: true,
			maxlength: [1000, 'Review cannot exceed 1000 characters'],
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		isVerifiedPurchase: {
			type: Boolean,
			default: false,
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: Date,
		instructorReply: {
			message: String,
			repliedAt: Date,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		helpfulCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Compound unique index - one review per user per course
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });
reviewSchema.index({ courseId: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Update course rating after review
reviewSchema.post('save', async function () {
	const Course = mongoose.model('Course');
	const reviews = await mongoose.model('Review').find({ courseId: this.courseId });

	const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
	const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

	await Course.findByIdAndUpdate(this.courseId, {
		'ratings.average': Math.round(averageRating * 10) / 10,
		'ratings.count': reviews.length,
	});
});

// Update course rating after review deletion
reviewSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		const Course = mongoose.model('Course');
		const reviews = await mongoose.model('Review').find({ courseId: doc.courseId });

		const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

		await Course.findByIdAndUpdate(doc.courseId, {
			'ratings.average': Math.round(averageRating * 10) / 10,
			'ratings.count': reviews.length,
		});
	}
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
