import mongoose from 'mongoose';

const courseVersionSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		version: {
			type: String,
			required: true,
		},
		versionNumber: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		curriculum: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		changeLog: {
			type: String,
			required: true,
		},
		changes: [
			{
				type: {
					type: String,
					enum: ['added', 'modified', 'removed'],
				},
				section: {
					type: String,
				},
				description: {
					type: String,
				},
			},
		],
		status: {
			type: String,
			enum: ['draft', 'active', 'deprecated', 'archived'],
			default: 'draft',
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		publishedAt: {
			type: Date,
		},
		deprecatedAt: {
			type: Date,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		stats: {
			activeEnrollments: {
				type: Number,
				default: 0,
			},
			completions: {
				type: Number,
				default: 0,
			},
			migrated: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
courseVersionSchema.index({ courseId: 1, versionNumber: -1 });
courseVersionSchema.index({ courseId: 1, isActive: 1 });

const CourseVersion = mongoose.model('CourseVersion', courseVersionSchema);

export default CourseVersion;
