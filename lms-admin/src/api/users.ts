import apiClient from '@/api/client';

export interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	avatar?: string;
	phone?: string;
	bio?: string;
	isActive?: boolean;
	isBlocked?: boolean;
	blockReason?: string;
	lastLogin?: string;
	isEmailVerified?: boolean;
	isOnline?: boolean;
}

export const usersApi = {
	getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
		apiClient.get<User[]>('/admin/users', { params }),
	getUserById: (id: string) => apiClient.get<User>(`/admin/users/${id}`),
	updateUser: (id: string, data: Partial<User>) => apiClient.put<User>(`/admin/users/${id}`, data),
	createUser: (data: Partial<User>) => apiClient.post<User>('/admin/users', data),
	deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
	blockUser: (id: string, data: { isBlocked: boolean; reason?: string }) =>
		apiClient.put(`/admin/users/${id}/block`, data),
	resetPassword: (id: string, data: { newPassword: string }) =>
		apiClient.post(`/admin/users/${id}/reset-password`, data),
};
