import { post, get } from './client';

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
	login: (data: LoginRequest) => post<LoginResponse>('/auth/login', data),
	refreshToken: () => post<{ data: { accessToken: string } }>('/auth/refresh'),
	logout: () => post('/auth/logout'),
	getProfile: () => get<User>('/auth/me'),
};
