import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Category name is required'],
			unique: true,
			trim: true,
			maxlength: [100, 'Category name cannot exceed 100 characters'],
		},
		description: {
			type: String,
			maxlength: [500, 'Description cannot exceed 500 characters'],
			default: null,
		},
		parentCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			default: null,
		},
	},
	{ timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
