import { create } from 'zustand';

export interface Pagination {
	page: number;
	limit: number;
	total: number;
}

interface QueryState {
	data: Record<string, any>;
	loading: Record<string, boolean>;
	error: Record<string, any>;
	pagination: Record<string, Pagination>;

	// Actions
	setData: (key: string, value: any) => void;
	setLoading: (key: string, value: boolean) => void;
	setError: (key: string, value: any) => void;
	setPagination: (key: string, value: Pagination) => void;
	getCache: (key: string) => any;
	getPagination: (key: string) => Pagination | undefined;
	clearCache: (key?: string) => void;
	reset: () => void;
}

export const useQuery = create<QueryState>((set, get) => ({
	data: {},
	loading: {},
	error: {},
	pagination: {},

	setData: (key: string, value: any) =>
		set((state) => ({
			data: { ...state.data, [key]: value },
			error: { ...state.error, [key]: null },
		})),

	setLoading: (key: string, value: boolean) =>
		set((state) => ({
			loading: { ...state.loading, [key]: value },
		})),

	setError: (key: string, value: any) =>
		set((state) => ({
			error: { ...state.error, [key]: value },
		})),

	setPagination: (key: string, value: Pagination) =>
		set((state) => ({
			pagination: { ...state.pagination, [key]: value },
		})),

	getCache: (key: string) => {
		const state = get();
		return state.data[key];
	},

	getPagination: (key: string) => {
		const state = get();
		return state.pagination[key];
	},

	clearCache: (key?: string) =>
		set((state) => {
			if (key) {
				// Xóa cache của một key cụ thể
				const newData = { ...state.data };
				const newPagination = { ...state.pagination };
				delete newData[key];
				delete newPagination[key];
				return { data: newData, pagination: newPagination };
			}
			// Xóa hết cache
			return { data: {}, loading: {}, error: {}, pagination: {} };
		}),

	reset: () =>
		set(() => ({
			data: {},
			loading: {},
			error: {},
			pagination: {},
		})),
}));
