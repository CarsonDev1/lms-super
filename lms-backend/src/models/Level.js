import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Level name is required'],
			unique: true,
			trim: true,
			minlength: [2, 'Level name must be at least 2 characters'],
			maxlength: [50, 'Level name cannot exceed 50 characters'],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters'],
		},
		order: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Index for faster queries
levelSchema.index({ name: 1 });
levelSchema.index({ order: 1 });

const Level = mongoose.model('Level', levelSchema);

export default Level;
