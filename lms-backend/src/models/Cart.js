import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		items: [
			{
				courseId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Course',
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				discount: {
					type: Number,
					default: 0,
				},
				addedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		couponCode: String,
		couponDiscount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Index
cartSchema.index({ userId: 1 });

// Calculate total
cartSchema.virtual('total').get(function () {
	const subtotal = this.items.reduce((sum, item) => {
		const itemTotal = item.price - (item.price * item.discount) / 100;
		return sum + itemTotal;
	}, 0);

	return Math.max(0, subtotal - this.couponDiscount);
});

// Add item to cart
cartSchema.methods.addItem = async function (courseId, price, discount = 0) {
	const existingItem = this.items.find((item) => item.courseId.toString() === courseId.toString());

	if (!existingItem) {
		this.items.push({ courseId, price, discount });
		await this.save();
	}

	return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function (courseId) {
	this.items = this.items.filter((item) => item.courseId.toString() !== courseId.toString());
	await this.save();
	return this;
};

// Clear cart
cartSchema.methods.clearCart = async function () {
	this.items = [];
	this.couponCode = undefined;
	this.couponDiscount = 0;
	await this.save();
	return this;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
