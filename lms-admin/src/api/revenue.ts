import apiClient from '@/api/client';

export interface RevenueReport {
	byPaymentMethod: { _id: string; revenue: number; orders: number }[];
	byInstructor: {
		_id: string;
		instructor: { name: string; email: string };
		revenue: number;
		orders: number;
	}[];
	daily: { _id: { year: number; month: number; day: number }; revenue: number; orders: number }[];
}

export const revenueApi = {
	getRevenueReport: (params?: { startDate?: string; endDate?: string }) =>
		apiClient.get<RevenueReport>('/admin/revenue', { params }),
};
