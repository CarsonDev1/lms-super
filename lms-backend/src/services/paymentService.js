import QRCode from 'qrcode';
import axios from 'axios';
import logger from '../config/logger.js';

/**
 * Generate VietQR payment QR code
 * @param {Object} orderData - Order information
 * @returns {Promise<string>} Base64 QR code image
 */
export const generateVietQR = async (orderData) => {
	try {
		const { amount, accountNumber, accountName, bankCode, content } = orderData;

		// VietQR format: Banking APP link
		const qrData = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(
			content
		)}&accountName=${encodeURIComponent(accountName)}`;

		// Generate QR code as base64
		const qrCodeBase64 = await QRCode.toDataURL(qrData, {
			errorCorrectionLevel: 'M',
			type: 'image/png',
			width: 400,
			margin: 1,
		});

		return qrCodeBase64;
	} catch (error) {
		logger.error('VietQR generation error:', error);
		throw new Error('Failed to generate VietQR code');
	}
};

/**
 * Generate payment content for bank transfer
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID
 * @returns {string} Payment content
 */
export const generatePaymentContent = (orderId, userId) => {
	return `LMS ${orderId} ${userId.slice(-6)}`.toUpperCase();
};

/**
 * SePay API integration
 */
export const sepayService = {
	/**
	 * Create SePay payment order
	 */
	createPayment: async (orderData) => {
		try {
			const { amount, orderId, returnUrl, cancelUrl, description } = orderData;

			// Replace with actual SePay API endpoint and credentials
			const response = await axios.post(
				process.env.SEPAY_API_URL || 'https://api.sepay.vn/v1/payments',
				{
					amount,
					order_id: orderId,
					return_url: returnUrl,
					cancel_url: cancelUrl,
					description,
					currency: 'VND',
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
					},
				}
			);

			return {
				success: true,
				paymentUrl: response.data.payment_url,
				sepayOrderId: response.data.order_id,
			};
		} catch (error) {
			logger.error('SePay create payment error:', error);
			throw new Error('Failed to create SePay payment');
		}
	},

	/**
	 * Verify SePay payment callback
	 */
	verifyPayment: async (callbackData) => {
		try {
			const { transaction_id, order_id, status, signature } = callbackData;

			// Verify signature (implement based on SePay documentation)
			const calculatedSignature = generateSepaySignature(callbackData);

			if (signature !== calculatedSignature) {
				logger.error('Invalid SePay signature');
				return { success: false, message: 'Invalid signature' };
			}

			return {
				success: status === 'success',
				transactionId: transaction_id,
				orderId: order_id,
				status,
			};
		} catch (error) {
			logger.error('SePay verify payment error:', error);
			throw new Error('Failed to verify SePay payment');
		}
	},

	/**
	 * Check SePay payment status
	 */
	checkPaymentStatus: async (sepayOrderId) => {
		try {
			const response = await axios.get(`${process.env.SEPAY_API_URL}/v1/payments/${sepayOrderId}`, {
				headers: {
					Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
				},
			});

			return {
				success: true,
				status: response.data.status,
				transactionId: response.data.transaction_id,
			};
		} catch (error) {
			logger.error('SePay check status error:', error);
			throw new Error('Failed to check payment status');
		}
	},

	/**
	 * Refund SePay payment
	 */
	refundPayment: async (sepayOrderId, amount, reason) => {
		try {
			const response = await axios.post(
				`${process.env.SEPAY_API_URL}/v1/refunds`,
				{
					order_id: sepayOrderId,
					amount,
					reason,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
					},
				}
			);

			return {
				success: true,
				refundId: response.data.refund_id,
			};
		} catch (error) {
			logger.error('SePay refund error:', error);
			throw new Error('Failed to process refund');
		}
	},
};

/**
 * Generate SePay signature
 * @param {Object} data - Payment data
 * @returns {string} Signature
 */
async function generateSepaySignature(data) {
	const crypto = await import('crypto');
	const secretKey = process.env.SEPAY_SECRET_KEY;

	// Sort keys and create signature string
	const sortedKeys = Object.keys(data).sort();
	const signatureString = sortedKeys.map((key) => `${key}=${data[key]}`).join('&');

	return crypto.default.createHmac('sha256', secretKey).update(signatureString).digest('hex');
}

/**
 * Bank information for manual transfer
 */
export const getBankInfo = () => {
	return {
		bankCode: process.env.BANK_CODE || 'VCB',
		accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
		accountName: process.env.BANK_ACCOUNT_NAME || 'LMS PLATFORM',
		bankName: process.env.BANK_NAME || 'Vietcombank',
	};
};

export default {
	generateVietQR,
	generatePaymentContent,
	sepayService,
	getBankInfo,
};
