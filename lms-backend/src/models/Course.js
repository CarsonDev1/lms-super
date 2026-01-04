import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			maxlength: [200, 'Title cannot exceed 200 characters'],
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			trim: true,
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			maxlength: [2000, 'Description cannot exceed 2000 characters'],
		},
		instructor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Instructor is required'],
		},
		thumbnail: {
			type: String,
			default: null,
		},
		previewVideo: {
			type: String,
			default: null,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			required: [true, 'Category is required'],
		},
		levelId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Level',
			required: [true, 'Level is required'],
		},
		tags: {
			type: [String],
			default: [],
		},
		language: {
			type: String,
			default: 'Vietnamese',
		},
		price: {
			type: Number,
			required: [true, 'Price is required'],
			min: [0, 'Price cannot be negative'],
		},
		discount: {
			type: Number,
			min: [0, 'Discount cannot be negative'],
			max: [100, 'Discount cannot exceed 100%'],
			default: 0,
		},
		curriculum: [
			{
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					default: () => new mongoose.Types.ObjectId(),
				},
				title: {
					type: String,
					required: true,
				},
				order: {
					type: Number,
					required: true,
				},
				lessons: [
					{
						_id: {
							type: mongoose.Schema.Types.ObjectId,
							default: () => new mongoose.Types.ObjectId(),
						},
						title: {
							type: String,
							required: true,
						},
						videoUrl: String,
						duration: Number, // in seconds
						order: Number,
						isFree: {
							type: Boolean,
							default: false,
						},
						resources: [
							{
								title: String,
								url: String,
								type: String, // pdf, doc, video, etc.
							},
						],
					},
				],
			},
		],
		status: {
			type: String,
			enum: ['draft', 'pending', 'approved', 'published', 'archived'],
			default: 'draft',
		},
		ratings: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				default: 0,
			},
		},
		totalStudents: {
			type: Number,
			default: 0,
		},
		auditLog: [
			{
				action: {
					type: String,
					enum: ['created', 'submitted', 'approved', 'rejected', 'published', 'unpublished', 'archived'],
				},
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				comment: String,
				timestamp: {
					type: Date,
					default: Date.now,
				},
			},
		],
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		reviewComment: String,
		publishedAt: Date,
		featured: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Index for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ categoryId: 1 });
courseSchema.index({ levelId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ tags: 1 });

// Generate slug before saving
courseSchema.pre('save', function (next) {
	if (this.isModified('title') && !this.slug) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}
	next();
});

// Virtual for student count
courseSchema.virtual('studentCount').get(function () {
	return this.totalStudents;
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
