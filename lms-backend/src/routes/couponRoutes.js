import express from 'express';
import {
	createCoupon,
	getAllCoupons,
	getCouponById,
	updateCoupon,
	deleteCoupon,
	validateCoupon,
} from '../controllers/couponController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes
router.post('/validate/:code', validateCoupon);

// Admin routes
router.post('/', authorize('admin'), createCoupon);
router.get('/', authorize('admin'), getAllCoupons);
router.get('/:couponId', authorize('admin'), getCouponById);
router.put('/:couponId', authorize('admin'), updateCoupon);
router.delete('/:couponId', authorize('admin'), deleteCoupon);

export default router;
