import apiClient from '@/api/client';

export interface AdminDashboard {
	users: { total: number; students: number; instructors: number; online: number };
	courses: { total: number; published: number; pending: number; draft: number };
	enrollments: { total: number; active: number; completed: number };
	revenue: { total: number; totalOrders: number; averageOrderValue: number };
	recentOrders?: any[];
	topCourses?: any[];
	monthlyRevenue?: any[];
}

export const adminApi = {
	getDashboard: () => apiClient.get<AdminDashboard>('/admin/dashboard'),
	getRevenue: (params?: { startDate?: string; endDate?: string }) => apiClient.get<any>('/admin/revenue', { params }),
	getPendingCourses: () => apiClient.get<any[]>('/admin/courses/pending'),
};
