import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: [true, 'Coupon code is required'],
			unique: true,
			uppercase: true,
			trim: true,
			minlength: [3, 'Code must be at least 3 characters'],
			maxlength: [20, 'Code cannot exceed 20 characters'],
		},
		description: {
			type: String,
			maxlength: 500,
		},
		type: {
			type: String,
			enum: ['percentage', 'fixed'],
			required: true,
		},
		value: {
			type: Number,
			required: true,
			min: [0, 'Value cannot be negative'],
		},
		maxUses: {
			type: Number,
			default: null, // null means unlimited
		},
		usedCount: {
			type: Number,
			default: 0,
		},
		maxUsesPerUser: {
			type: Number,
			default: 1,
		},
		validFrom: {
			type: Date,
			required: true,
		},
		validTo: {
			type: Date,
			required: true,
		},
		applicableCourses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Course',
			},
		],
		applicableCategories: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Category',
			},
		],
		minimumPurchase: {
			type: Number,
			default: 0,
		},
		maxDiscount: {
			type: Number,
			default: null, // For percentage discounts
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		usedBy: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				orderId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Order',
				},
				usedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });
couponSchema.index({ isActive: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function () {
	const now = new Date();
	return (
		this.isActive &&
		now >= this.validFrom &&
		now <= this.validTo &&
		(this.maxUses === null || this.usedCount < this.maxUses)
	);
};

// Check if user can use coupon
couponSchema.methods.canUserUse = function (userId) {
	const userUsage = this.usedBy.filter((u) => u.userId.toString() === userId.toString()).length;
	return userUsage < this.maxUsesPerUser;
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (amount) {
	let discount = 0;

	if (this.type === 'percentage') {
		discount = (amount * this.value) / 100;
		if (this.maxDiscount && discount > this.maxDiscount) {
			discount = this.maxDiscount;
		}
	} else {
		discount = this.value;
	}

	return Math.min(discount, amount); // Don't exceed original amount
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
