import apiClient from '@/api/client';

export interface Coupon {
	_id: string;
	code: string;
	description?: string;
	type: 'percentage' | 'fixed';
	value: number;
	maxUses?: number | null;
	usedCount: number;
	maxUsesPerUser: number;
	validFrom: string;
	validTo: string;
	minimumPurchase?: number;
	maxDiscount?: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export const couponsApi = {
	getCoupons: (params?: { page?: number; limit?: number }) => apiClient.get<Coupon[]>('/coupons', { params }),
	getCouponById: (id: string) => apiClient.get<Coupon>(`/coupons/${id}`),
	createCoupon: (data: Partial<Coupon>) => apiClient.post<Coupon>('/coupons', data),
	updateCoupon: (id: string, data: Partial<Coupon>) => apiClient.put<Coupon>(`/coupons/${id}`, data),
	deleteCoupon: (id: string) => apiClient.delete(`/coupons/${id}`),
};
