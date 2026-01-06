import mongoose from 'mongoose';

const cmsPageSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		excerpt: {
			type: String,
		},
		type: {
			type: String,
			enum: ['page', 'faq', 'policy', 'about', 'terms', 'privacy'],
			default: 'page',
		},
		status: {
			type: String,
			enum: ['draft', 'published', 'archived'],
			default: 'draft',
		},
		featuredImage: {
			type: String,
		},
		metaTitle: {
			type: String,
		},
		metaDescription: {
			type: String,
		},
		metaKeywords: {
			type: [String],
			default: [],
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		publishedAt: {
			type: Date,
		},
		lastEditedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		viewCount: {
			type: Number,
			default: 0,
		},
		order: {
			type: Number,
			default: 0,
		},
		showInMenu: {
			type: Boolean,
			default: false,
		},
		menuTitle: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
cmsPageSchema.index({ slug: 1 });
cmsPageSchema.index({ type: 1, status: 1 });
cmsPageSchema.index({ status: 1 });

const CMSPage = mongoose.model('CMSPage', cmsPageSchema);

export default CMSPage;
