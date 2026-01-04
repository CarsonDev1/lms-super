import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *               - validFrom
 *               - validTo
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               value:
 *                 type: number
 *               maxUses:
 *                 type: number
 *               maxUsesPerUser:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date
 *               validTo:
 *                 type: string
 *                 format: date
 *               applicableCourses:
 *                 type: array
 *                 items:
 *                   type: string
 *               minimumPurchase:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Coupon created
 */
export const createCoupon = async (req, res) => {
	try {
		const couponData = {
			...req.body,
			code: req.body.code.toUpperCase(),
			createdBy: req.user._id,
		};

		const coupon = await Coupon.create(couponData);

		res.status(201).json({
			success: true,
			message: 'Coupon created successfully',
			data: coupon,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'Coupon code already exists',
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to create coupon',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of coupons
 */
export const getAllCoupons = async (req, res) => {
	try {
		const { page = 1, limit = 20, isActive } = req.query;

		const query = {};
		if (isActive !== undefined) {
			query.isActive = isActive === 'true';
		}

		const skip = (page - 1) * limit;

		const coupons = await Coupon.find(query)
			.populate('createdBy', 'name email')
			.populate('applicableCourses', 'title')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Coupon.countDocuments(query);

		res.status(200).json({
			success: true,
			data: {
				coupons,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch coupons',
		});
	}
};

/**
 * @swagger
 * /api/coupons/{couponId}:
 *   get:
 *     summary: Get coupon by ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *     responses:
 *       200:
 *         description: Coupon details
 */
export const getCouponById = async (req, res) => {
	try {
		const { couponId } = req.params;

		const coupon = await Coupon.findById(couponId)
			.populate('createdBy', 'name email')
			.populate('applicableCourses', 'title thumbnail price');

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: 'Coupon not found',
			});
		}

		res.status(200).json({
			success: true,
			data: coupon,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch coupon',
		});
	}
};

/**
 * @swagger
 * /api/coupons/{couponId}:
 *   put:
 *     summary: Update coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Coupon updated
 */
export const updateCoupon = async (req, res) => {
	try {
		const { couponId } = req.params;
		const updates = req.body;

		if (updates.code) {
			updates.code = updates.code.toUpperCase();
		}

		const coupon = await Coupon.findByIdAndUpdate(couponId, updates, {
			new: true,
			runValidators: true,
		});

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: 'Coupon not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Coupon updated successfully',
			data: coupon,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'Coupon code already exists',
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to update coupon',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/coupons/{couponId}:
 *   delete:
 *     summary: Delete coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
export const deleteCoupon = async (req, res) => {
	try {
		const { couponId } = req.params;

		const coupon = await Coupon.findByIdAndDelete(couponId);

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: 'Coupon not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Coupon deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete coupon',
		});
	}
};

/**
 * @swagger
 * /api/coupons/validate/{code}:
 *   post:
 *     summary: Validate coupon code
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon validation result
 */
export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.params;
		const { courseId, amount } = req.body;
		const userId = req.user._id;

		const coupon = await Coupon.findOne({ code: code.toUpperCase() });

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: 'Coupon not found',
			});
		}

		if (!coupon.isValid()) {
			return res.status(400).json({
				success: false,
				message: 'Coupon is invalid or expired',
			});
		}

		if (!coupon.canUserUse(userId)) {
			return res.status(400).json({
				success: false,
				message: 'You have already used this coupon',
			});
		}

		// Check if coupon is applicable to the course
		if (courseId && coupon.applicableCourses.length > 0) {
			if (!coupon.applicableCourses.some((id) => id.toString() === courseId)) {
				return res.status(400).json({
					success: false,
					message: 'This coupon is not applicable to the selected course',
				});
			}
		}

		if (amount && amount < coupon.minimumPurchase) {
			return res.status(400).json({
				success: false,
				message: `Minimum purchase of ${coupon.minimumPurchase} required`,
			});
		}

		const discount = amount ? coupon.calculateDiscount(amount) : 0;

		res.status(200).json({
			success: true,
			message: 'Coupon is valid',
			data: {
				code: coupon.code,
				type: coupon.type,
				value: coupon.value,
				discount,
				description: coupon.description,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to validate coupon',
		});
	}
};

export default {
	createCoupon,
	getAllCoupons,
	getCouponById,
	updateCoupon,
	deleteCoupon,
	validateCoupon,
};
