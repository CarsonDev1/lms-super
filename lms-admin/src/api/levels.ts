import apiClient from '@/api/client';

export interface Level {
	_id: string;
	name: string;
	description?: string;
	order?: number;
	createdAt: string;
	updatedAt: string;
}

export const levelsApi = {
	getLevels: (params?: { page?: number; limit?: number }) => apiClient.get<Level[]>('/levels', { params }),
	getLevelById: (id: string) => apiClient.get<Level>(`/levels/${id}`),
	createLevel: (data: { name: string; description?: string; order?: number }) =>
		apiClient.post<Level>('/levels', data),
	updateLevel: (id: string, data: Partial<Level>) => apiClient.put<Level>(`/levels/${id}`, data),
	deleteLevel: (id: string) => apiClient.delete(`/levels/${id}`),
};
