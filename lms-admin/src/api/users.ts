import apiClient from '@/api/client';

export interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	avtartarUrl?: string;
}

export const usersApi = {
	getUsers: (params?: { page?: number; limit?: number }) => apiClient.get<User[]>('/admin/users', { params }),
};
