import apiClient from '@/api/client';

export interface Announcement {
	_id: string;
	title: string;
	content: string;
	type: 'info' | 'warning' | 'success' | 'error' | 'maintenance' | 'feature';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	targetAudience: {
		scope: 'all' | 'role' | 'course' | 'user';
		roles?: string[];
	};
	status: 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';
	scheduling?: {
		publishAt?: string;
		expiresAt?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export const announcementsApi = {
	getAnnouncements: (params?: { page?: number; limit?: number }) =>
		apiClient.get<Announcement[]>('/announcements', { params }),
	getAnnouncementById: (id: string) => apiClient.get<Announcement>(`/announcements/${id}`),
	createAnnouncement: (data: Partial<Announcement>) => apiClient.post<Announcement>('/announcements', data),
	updateAnnouncement: (id: string, data: Partial<Announcement>) =>
		apiClient.put<Announcement>(`/announcements/${id}`, data),
	deleteAnnouncement: (id: string) => apiClient.delete(`/announcements/${id}`),
	activateAnnouncement: (id: string) => apiClient.put(`/announcements/${id}/activate`),
	deactivateAnnouncement: (id: string) => apiClient.put(`/announcements/${id}/deactivate`),
};
