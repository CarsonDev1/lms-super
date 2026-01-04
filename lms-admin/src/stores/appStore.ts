import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
	sidebarCollapsed: boolean;
	loading: boolean;
	setSidebarCollapsed: (collapsed: boolean) => void;
	setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
	devtools((set) => ({
		sidebarCollapsed: false,
		loading: false,
		setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
		setLoading: (loading) => set({ loading }),
	}))
);
