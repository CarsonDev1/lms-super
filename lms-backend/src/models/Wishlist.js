import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		courses: [
			{
				courseId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Course',
				},
				addedAt: {
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

// Index
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'courses.courseId': 1 });

// Add course to wishlist
wishlistSchema.methods.addCourse = async function (courseId) {
	const exists = this.courses.some((item) => item.courseId.toString() === courseId.toString());

	if (!exists) {
		this.courses.push({ courseId });
		await this.save();
	}

	return this;
};

// Remove course from wishlist
wishlistSchema.methods.removeCourse = async function (courseId) {
	this.courses = this.courses.filter((item) => item.courseId.toString() !== courseId.toString());
	await this.save();
	return this;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
