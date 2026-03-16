import apiClient from '@/api/client';

export interface Enrollment {
	_id: string;
	userId: { _id: string; name: string; email: string; avatar?: string };
	courseId: { _id: string; title: string; thumbnail?: string };
	completionPercentage: number;
	certificateIssued: boolean;
	enrolledAt: string;
	lastAccessedAt: string;
	completedAt?: string;
	createdAt: string;
}

export const enrollmentsApi = {
	getAllEnrollments: (params?: { page?: number; limit?: number; search?: string }) =>
		apiClient.get<any>('/admin/enrollments', { params }),
};
