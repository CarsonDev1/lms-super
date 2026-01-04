import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
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
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		originalAmount: {
			type: Number,
			required: true,
		},
		couponCode: String,
		discountAmount: {
			type: Number,
			default: 0,
		},
		paymentMethod: {
			type: String,
			enum: ['sepay', 'vietqr', 'manual'],
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
			default: 'pending',
		},
		transactionId: String,
		sepayOrderId: String,
		qrCode: String, // Base64 or URL
		paymentDetails: {
			bankCode: String,
			accountNumber: String,
			accountName: String,
			content: String,
		},
		refundDetails: {
			reason: String,
			refundedAt: Date,
			refundedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			amount: Number,
		},
		invoiceUrl: String,
		completedAt: Date,
		expiredAt: Date, // For pending payments
		notes: String,
	},
	{
		timestamps: true,
	}
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ courseId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ sepayOrderId: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate unique transaction ID
orderSchema.pre('save', function (next) {
	if (this.isNew && !this.transactionId) {
		this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
	}
	next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
