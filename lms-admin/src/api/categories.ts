import apiClient from '@/api/client';

export interface Category {
	_id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export const categoriesApi = {
	getCategories: () => apiClient.get<Category[]>('/categories'),
	getCategoryById: (id: string) => apiClient.get<Category>(`/categories/${id}`),
	createCategory: (data: { name: string; description?: string }) => apiClient.post('/categories', data),
	updateCategory: (id: string, data: { name?: string; description?: string }) =>
		apiClient.put(`/categories/${id}`, data),
	deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),
};
