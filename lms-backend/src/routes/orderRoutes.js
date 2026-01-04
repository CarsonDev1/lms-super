import express from 'express';
import {
	createOrder,
	generateVietQRForOrder,
	createSepayPayment,
	handlePaymentWebhook,
	getMyOrders,
	getOrderById,
	requestRefund,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Webhook route (no authentication)
router.post('/webhook', handlePaymentWebhook);

// All other routes require authentication
router.use(authenticate);

// Student routes
router.post('/', createOrder);
router.post('/:orderId/vietqr', generateVietQRForOrder);
router.post('/:orderId/sepay', createSepayPayment);
router.get('/my-orders', getMyOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/refund', requestRefund);

export default router;
