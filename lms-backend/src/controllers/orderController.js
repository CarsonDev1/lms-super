import Order from '../models/Order.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import { generateVietQR, generatePaymentContent, sepayService, getBankInfo } from '../services/paymentService.js';
import logger from '../config/logger.js';

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - paymentMethod
 *             properties:
 *               courseId:
 *                 type: string
 *               couponCode:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [vietqr, sepay]
 *     responses:
 *       201:
 *         description: Order created successfully
 */
export const createOrder = async (req, res) => {
	try {
		const { courseId, couponCode, paymentMethod } = req.body;
		const userId = req.user._id;

		// Check if course exists and is published
		const course = await Course.findById(courseId);
		if (!course || course.status !== 'published') {
			return res.status(400).json({
				success: false,
				message: 'Course not found or not available',
			});
		}

		// Check if already enrolled
		const existingEnrollment = await Enrollment.findOne({ userId, courseId });
		if (existingEnrollment) {
			return res.status(400).json({
				success: false,
				message: 'You are already enrolled in this course',
			});
		}

		// Check if there's a pending order
		const pendingOrder = await Order.findOne({
			userId,
			courseId,
			paymentStatus: 'pending',
		});

		if (pendingOrder) {
			return res.status(200).json({
				success: true,
				message: 'You already have a pending order for this course',
				data: pendingOrder,
			});
		}

		let originalAmount = course.price;
		let discountAmount = 0;
		let coupon = null;

		// Apply course discount
		if (course.discount > 0) {
			discountAmount += (originalAmount * course.discount) / 100;
		}

		// Validate and apply coupon
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

			if (!coupon || !coupon.isValid()) {
				return res.status(400).json({
					success: false,
					message: 'Invalid or expired coupon code',
				});
			}

			if (!coupon.canUserUse(userId)) {
				return res.status(400).json({
					success: false,
					message: 'You have already used this coupon',
				});
			}

			// Check if coupon is applicable to this course
			if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
				return res.status(400).json({
					success: false,
					message: 'This coupon is not applicable to this course',
				});
			}

			const amountAfterCourseDiscount = originalAmount - discountAmount;
			const couponDiscount = coupon.calculateDiscount(amountAfterCourseDiscount);
			discountAmount += couponDiscount;
		}

		const finalAmount = Math.max(0, originalAmount - discountAmount);

		// Create order
		const order = await Order.create({
			userId,
			courseId,
			amount: finalAmount,
			originalAmount,
			couponCode: couponCode?.toUpperCase(),
			discountAmount,
			paymentMethod,
			paymentStatus: 'pending',
			expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		});

		// If coupon was used, track it
		if (coupon) {
			coupon.usedBy.push({
				userId,
				orderId: order._id,
			});
			coupon.usedCount += 1;
			await coupon.save();
		}

		res.status(201).json({
			success: true,
			message: 'Order created successfully',
			data: order,
		});
	} catch (error) {
		logger.error('Create order error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create order',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/orders/{orderId}/vietqr:
 *   post:
 *     summary: Generate VietQR for order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *     responses:
 *       200:
 *         description: VietQR generated
 */
export const generateVietQRForOrder = async (req, res) => {
	try {
		const { orderId } = req.params;
		const userId = req.user._id;

		const order = await Order.findOne({ _id: orderId, userId });

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		if (order.paymentStatus !== 'pending') {
			return res.status(400).json({
				success: false,
				message: 'Order is not pending payment',
			});
		}

		const bankInfo = getBankInfo();
		const paymentContent = generatePaymentContent(orderId, userId.toString());

		const qrCode = await generateVietQR({
			amount: order.amount,
			accountNumber: bankInfo.accountNumber,
			accountName: bankInfo.accountName,
			bankCode: bankInfo.bankCode,
			content: paymentContent,
		});

		// Update order with payment details
		order.qrCode = qrCode;
		order.paymentDetails = {
			...bankInfo,
			content: paymentContent,
		};
		await order.save();

		res.status(200).json({
			success: true,
			data: {
				qrCode,
				bankInfo: {
					...bankInfo,
					content: paymentContent,
				},
				amount: order.amount,
				orderId: order._id,
			},
		});
	} catch (error) {
		logger.error('Generate VietQR error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to generate VietQR',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/orders/{orderId}/sepay:
 *   post:
 *     summary: Create SePay payment
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *     responses:
 *       200:
 *         description: SePay payment URL generated
 */
export const createSepayPayment = async (req, res) => {
	try {
		const { orderId } = req.params;
		const userId = req.user._id;

		const order = await Order.findOne({ _id: orderId, userId }).populate('courseId');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		if (order.paymentStatus !== 'pending') {
			return res.status(400).json({
				success: false,
				message: 'Order is not pending payment',
			});
		}

		const paymentResult = await sepayService.createPayment({
			amount: order.amount,
			orderId: order._id.toString(),
			returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
			cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
			description: `Payment for course: ${order.courseId.title}`,
		});

		if (!paymentResult.success) {
			return res.status(500).json({
				success: false,
				message: 'Failed to create payment',
			});
		}

		// Update order with SePay details
		order.sepayOrderId = paymentResult.sepayOrderId;
		order.paymentStatus = 'processing';
		await order.save();

		res.status(200).json({
			success: true,
			data: {
				paymentUrl: paymentResult.paymentUrl,
				orderId: order._id,
			},
		});
	} catch (error) {
		logger.error('Create SePay payment error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create SePay payment',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Handle payment webhook
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
export const handlePaymentWebhook = async (req, res) => {
	try {
		const webhookData = req.body;
		logger.info('Payment webhook received:', webhookData);

		// Verify webhook signature (if using SePay)
		if (webhookData.signature) {
			const verificationResult = await sepayService.verifyPayment(webhookData);

			if (!verificationResult.success) {
				return res.status(400).json({
					success: false,
					message: 'Invalid webhook signature',
				});
			}
		}

		const { orderId, transactionId, status } = webhookData;

		const order = await Order.findById(orderId).populate('courseId');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		// Update order status
		order.transactionId = transactionId;
		order.paymentStatus = status === 'success' ? 'completed' : 'failed';

		if (status === 'success') {
			order.completedAt = new Date();

			// Create enrollment
			await Enrollment.create({
				userId: order.userId,
				courseId: order.courseId,
			});

			// Update course total students
			await Course.findByIdAndUpdate(order.courseId, {
				$inc: { totalStudents: 1 },
			});

			// Send notifications
			await Notification.create({
				userId: order.userId,
				type: 'payment_success',
				title: 'Payment Successful',
				message: `Payment completed for ${order.courseId.title}`,
				link: `/courses/${order.courseId._id}`,
				metadata: { orderId: order._id, courseId: order.courseId._id },
			});
		} else {
			await Notification.create({
				userId: order.userId,
				type: 'payment_failed',
				title: 'Payment Failed',
				message: `Payment failed for ${order.courseId.title}`,
				link: `/orders/${order._id}`,
				metadata: { orderId: order._id },
			});
		}

		await order.save();

		res.status(200).json({
			success: true,
			message: 'Webhook processed successfully',
		});
	} catch (error) {
		logger.error('Webhook processing error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to process webhook',
		});
	}
};

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
export const getMyOrders = async (req, res) => {
	try {
		const orders = await Order.find({ userId: req.user._id })
			.populate('courseId', 'title thumbnail price')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: orders,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch orders',
		});
	}
};

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *     responses:
 *       200:
 *         description: Order details
 */
export const getOrderById = async (req, res) => {
	try {
		const { orderId } = req.params;
		const order = await Order.findOne({
			_id: orderId,
			userId: req.user._id,
		}).populate('courseId userId');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch order',
		});
	}
};

/**
 * @swagger
 * /api/orders/{orderId}/refund:
 *   post:
 *     summary: Request order refund
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
export const requestRefund = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { reason } = req.body;
		const userId = req.user._id;

		const order = await Order.findOne({ _id: orderId, userId });

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		if (order.paymentStatus !== 'completed') {
			return res.status(400).json({
				success: false,
				message: 'Only completed orders can be refunded',
			});
		}

		// Process refund via SePay if applicable
		if (order.sepayOrderId) {
			await sepayService.refundPayment(order.sepayOrderId, order.amount, reason);
		}

		order.paymentStatus = 'refunded';
		order.refundDetails = {
			reason,
			refundedAt: new Date(),
			refundedBy: userId,
			amount: order.amount,
		};

		await order.save();

		// Remove enrollment
		await Enrollment.findOneAndDelete({
			userId,
			courseId: order.courseId,
		});

		// Update course total students
		await Course.findByIdAndUpdate(order.courseId, {
			$inc: { totalStudents: -1 },
		});

		res.status(200).json({
			success: true,
			message: 'Refund processed successfully',
			data: order,
		});
	} catch (error) {
		logger.error('Refund error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to process refund',
			error: error.message,
		});
	}
};

export default {
	createOrder,
	generateVietQRForOrder,
	createSepayPayment,
	handlePaymentWebhook,
	getMyOrders,
	getOrderById,
	requestRefund,
};
