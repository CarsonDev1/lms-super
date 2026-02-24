import apiClient from '@/api/client';

export interface CourseApproval {
	_id: string;
	courseId: {
		_id: string;
		title: string;
		thumbnail?: string;
	};
	submittedBy: {
		_id: string;
		name: string;
		email: string;
	};
	reviewedBy?: {
		_id: string;
		name: string;
	};
	status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_required';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	submissionType: 'new' | 'update' | 'revision';
	submittedAt: string;
	reviewedAt?: string;
}

export const courseApprovalsApi = {
	getApprovals: (params?: { page?: number; limit?: number; status?: string }) =>
		apiClient.get<CourseApproval[]>('/course-approvals', { params }),
	getApprovalById: (id: string) => apiClient.get<CourseApproval>(`/course-approvals/${id}`),
	approveCourse: (id: string, data: { notes?: string }) => apiClient.post(`/course-approvals/${id}/approve`, data),
	rejectCourse: (id: string, data: { reason: string; notes?: string }) =>
		apiClient.post(`/course-approvals/${id}/reject`, data),
	requestRevision: (id: string, data: { feedback: string; deadline?: string }) =>
		apiClient.post(`/course-approvals/${id}/request-revision`, data),
};
