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
	};
	revenue: {
		total: number;
		thisMonth: number;
	};
	ratings?: {
		average: number;
		total: number;
	};
	recentEnrollments?: any[];
	topCourses?: any[];
}

export const instructorApi = {
	getDashboard: () => apiClient.get<InstructorDashboard>('/analytics/instructor/dashboard'),
	getCourseAnalytics: (courseId: string) => apiClient.get<any>(`/analytics/courses/${courseId}`),
};
