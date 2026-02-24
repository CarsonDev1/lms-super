import apiClient from '@/api/client';

export interface InstructorCourse {
	_id: string;
	title: string;
	thumbnail?: string;
	description: string;
	price: number;
	discount: number;
	status: 'draft' | 'pending' | 'approved' | 'published' | 'archived' | 'rejected';
	featured: boolean;
	totalStudents: number;
	ratings: { average: number; count: number };
	createdAt: string;
	updatedAt: string;
}

export const instructorCoursesApi = {
	getMyCourses: (params?: { page?: number; limit?: number; status?: string }) =>
		apiClient.get<InstructorCourse[]>('/courses', { params }),
	getCourseById: (id: string) => apiClient.get<InstructorCourse>(`/courses/${id}`),
	createCourse: (data: Partial<InstructorCourse>) => apiClient.post<InstructorCourse>('/courses', data),
	updateCourse: (id: string, data: Partial<InstructorCourse>) =>
		apiClient.put<InstructorCourse>(`/courses/${id}`, data),
	deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`),
	submitForApproval: (data: { courseId: string; submissionType: string; submissionNotes?: string }) =>
		apiClient.post('/course-approvals/submit', data),
	getMySubmissions: (params?: { page?: number; limit?: number }) =>
		apiClient.get<any[]>('/course-approvals/my-submissions', { params }),
};
