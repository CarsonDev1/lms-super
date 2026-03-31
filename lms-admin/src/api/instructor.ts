import apiClient from '@/api/client';

export interface InstructorDashboard {
	courses: {
		total: number;
		published: number;
		draft: number;
		pending: number;
	};
	enrollments: {
		total: number;
		thisMonth: number;
		active?: number;
	};
	revenue: {
		total: number;
		thisMonth: number;
		totalRevenue?: number;
		totalOrders?: number;
	};
	ratings?: {
		average: number;
		total: number;
	};
	reviews?: {
		averageRating: number;
		totalReviews: number;
	};
	engagement?: {
		averageProgress: number;
		completionRate: number;
	};
	coursePerformance?: any[];
	recentEnrollments?: any[];
	topCourses?: any[];
}

export const instructorApi = {
	getDashboard: () => apiClient.get<InstructorDashboard>('/analytics/instructor/dashboard'),
	getCourseAnalytics: (courseId: string) => apiClient.get<any>(`/analytics/courses/${courseId}`),
};
