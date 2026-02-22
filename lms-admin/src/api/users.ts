import apiClient from '@/api/client';

export interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	avatar?: string;
	isActive?: boolean;
}

export const usersApi = {
	getUsers: (params?: { page?: number; limit?: number }) => apiClient.get<User[]>('/admin/users', { params }),
	getUserById: (id: string) => apiClient.get<User>(`/admin/users/${id}`),
	updateUser: (id: string, data: Partial<User>) => apiClient.put<User>(`/admin/users/${id}`, data),
	createUser: (data: Partial<User>) => apiClient.post<User>('/admin/users', data),
	deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
};
