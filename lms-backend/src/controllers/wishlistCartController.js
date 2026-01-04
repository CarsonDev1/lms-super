import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';

// ==================== WISHLIST CONTROLLERS ====================

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 */
export const getWishlist = async (req, res) => {
	try {
		const userId = req.user._id;

		let wishlist = await Wishlist.findOne({ userId }).populate({
			path: 'courses.courseId',
			populate: [
				{ path: 'instructor', select: 'name avatar' },
				{ path: 'categoryId', select: 'name' },
				{ path: 'levelId', select: 'name' },
			],
		});

		if (!wishlist) {
			wishlist = await Wishlist.create({ userId, courses: [] });
		}

		res.status(200).json({
			success: true,
			data: wishlist,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch wishlist',
		});
	}
};

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add course to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course added to wishlist
 */
export const addToWishlist = async (req, res) => {
	try {
		const { courseId } = req.body;
		const userId = req.user._id;

		// Validate course exists
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		let wishlist = await Wishlist.findOne({ userId });

		if (!wishlist) {
			wishlist = await Wishlist.create({ userId, courses: [] });
		}

		await wishlist.addCourse(courseId);

		const updatedWishlist = await Wishlist.findOne({ userId }).populate('courses.courseId');

		res.status(200).json({
			success: true,
			message: 'Course added to wishlist',
			data: updatedWishlist,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to add to wishlist',
		});
	}
};

/**
 * @swagger
 * /api/wishlist/{courseId}:
 *   delete:
 *     summary: Remove course from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: Course removed from wishlist
 */
export const removeFromWishlist = async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user._id;

		const wishlist = await Wishlist.findOne({ userId });

		if (!wishlist) {
			return res.status(404).json({
				success: false,
				message: 'Wishlist not found',
			});
		}

		await wishlist.removeCourse(courseId);

		res.status(200).json({
			success: true,
			message: 'Course removed from wishlist',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to remove from wishlist',
		});
	}
};

// ==================== CART CONTROLLERS ====================

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart
 */
export const getCart = async (req, res) => {
	try {
		const userId = req.user._id;

		let cart = await Cart.findOne({ userId }).populate({
			path: 'items.courseId',
			populate: [
				{ path: 'instructor', select: 'name' },
				{ path: 'categoryId', select: 'name' },
			],
		});

		if (!cart) {
			cart = await Cart.create({ userId, items: [] });
		}

		res.status(200).json({
			success: true,
			data: {
				...cart.toObject(),
				total: cart.total,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch cart',
		});
	}
};

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add course to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course added to cart
 */
export const addToCart = async (req, res) => {
	try {
		const { courseId } = req.body;
		const userId = req.user._id;

		// Validate course exists
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		let cart = await Cart.findOne({ userId });

		if (!cart) {
			cart = await Cart.create({ userId, items: [] });
		}

		await cart.addItem(courseId, course.price, course.discount);

		const updatedCart = await Cart.findOne({ userId }).populate('items.courseId');

		res.status(200).json({
			success: true,
			message: 'Course added to cart',
			data: {
				...updatedCart.toObject(),
				total: updatedCart.total,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to add to cart',
		});
	}
};

/**
 * @swagger
 * /api/cart/{courseId}:
 *   delete:
 *     summary: Remove course from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: Course removed from cart
 */
export const removeFromCart = async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user._id;

		const cart = await Cart.findOne({ userId });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: 'Cart not found',
			});
		}

		await cart.removeItem(courseId);

		res.status(200).json({
			success: true,
			message: 'Course removed from cart',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to remove from cart',
		});
	}
};

/**
 * @swagger
 * /api/cart/apply-coupon:
 *   post:
 *     summary: Apply coupon to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied
 */
export const applyCoupon = async (req, res) => {
	try {
		const { couponCode } = req.body;
		const userId = req.user._id;

		const cart = await Cart.findOne({ userId });

		if (!cart || cart.items.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Cart is empty',
			});
		}

		const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

		if (!coupon || !coupon.isValid()) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired coupon',
			});
		}

		if (!coupon.canUserUse(userId)) {
			return res.status(400).json({
				success: false,
				message: 'You have already used this coupon',
			});
		}

		// Calculate cart subtotal
		const subtotal = cart.items.reduce((sum, item) => {
			const itemTotal = item.price - (item.price * item.discount) / 100;
			return sum + itemTotal;
		}, 0);

		if (subtotal < coupon.minimumPurchase) {
			return res.status(400).json({
				success: false,
				message: `Minimum purchase of ${coupon.minimumPurchase} required`,
			});
		}

		const discount = coupon.calculateDiscount(subtotal);

		cart.couponCode = couponCode.toUpperCase();
		cart.couponDiscount = discount;
		await cart.save();

		res.status(200).json({
			success: true,
			message: 'Coupon applied successfully',
			data: {
				couponCode: cart.couponCode,
				discount,
				total: cart.total,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to apply coupon',
		});
	}
};

/**
 * @swagger
 * /api/cart/remove-coupon:
 *   delete:
 *     summary: Remove coupon from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed
 */
export const removeCoupon = async (req, res) => {
	try {
		const userId = req.user._id;

		const cart = await Cart.findOne({ userId });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: 'Cart not found',
			});
		}

		cart.couponCode = undefined;
		cart.couponDiscount = 0;
		await cart.save();

		res.status(200).json({
			success: true,
			message: 'Coupon removed',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to remove coupon',
		});
	}
};

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
export const clearCart = async (req, res) => {
	try {
		const userId = req.user._id;

		const cart = await Cart.findOne({ userId });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: 'Cart not found',
			});
		}

		await cart.clearCart();

		res.status(200).json({
			success: true,
			message: 'Cart cleared successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to clear cart',
		});
	}
};

export default {
	getWishlist,
	addToWishlist,
	removeFromWishlist,
	getCart,
	addToCart,
	removeFromCart,
	applyCoupon,
	removeCoupon,
	clearCart,
};
