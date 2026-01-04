import apiClient from './client';

export interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	data: {
		accessToken: string;
		user: User;
	};
}

export const authApi = {
	login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
	refreshToken: (data: { refreshToken: string }) => apiClient.post<{ refreshToken: string }>('/auth/refresh', data),
	logout: () => apiClient.post('/auth/logout'),
	getProfile: () => apiClient.get<User>('/auth/profile'),
};
