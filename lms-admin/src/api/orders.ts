import apiClient from '@/api/client';

export interface Order {
	_id: string;
	userId: { _id: string; name: string; email: string; avatar?: string };
	courseId: { _id: string; title: string; thumbnail?: string };
	amount: number;
	originalAmount: number;
	couponCode?: string;
	discountAmount: number;
	paymentMethod: 'sepay' | 'vietqr' | 'manual';
	paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
	transactionId?: string;
	completedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export const ordersApi = {
	getAllOrders: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
		apiClient.get<any>('/admin/orders', { params }),
};
