import { create } from 'zustand';

interface UIState {
	isLoginOpen: boolean;
	theme: 'light' | 'dark';
	openLogin: () => void;
	closeLogin: () => void;
	toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	isLoginOpen: false,
	theme: 'light',

	openLogin: () => set({ isLoginOpen: true }),
	closeLogin: () => set({ isLoginOpen: false }),

	toggleTheme: () =>
		set((s) => ({
			theme: s.theme === 'light' ? 'dark' : 'light',
		})),
}));
