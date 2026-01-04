import express from 'express';
import {
	getWishlist,
	addToWishlist,
	removeFromWishlist,
	getCart,
	addToCart,
	removeFromCart,
	applyCoupon,
	removeCoupon,
	clearCart,
} from '../controllers/wishlistCartController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:courseId', removeFromWishlist);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:courseId', removeFromCart);
router.post('/cart/apply-coupon', applyCoupon);
router.delete('/cart/remove-coupon', removeCoupon);
router.delete('/cart/clear', clearCart);

export default router;
