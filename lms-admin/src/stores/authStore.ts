import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	devtools(
		persist(
			(set) => ({
				user: null,
				token: null,
				isAuthenticated: false,
				setAuth: (user, token) => {
					localStorage.setItem('token', token);
					set({ user, token, isAuthenticated: true });
				},
				logout: () => {
					localStorage.removeItem('token');
					set({ user: null, token: null, isAuthenticated: false });
				},
			}),
			{
				name: 'auth-storage',
			}
		)
	)
);
