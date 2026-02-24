import apiClient from '@/api/client';

export interface CmsPage {
	_id: string;
	title: string;
	slug: string;
	content: string;
	metaTitle?: string;
	metaDescription?: string;
	status: 'draft' | 'published';
	showInMenu: boolean;
	order?: number;
	createdAt: string;
	updatedAt: string;
}

export const cmsApi = {
	getPages: (params?: { page?: number; limit?: number }) => apiClient.get<CmsPage[]>('/cms/pages', { params }),
	getPageById: (id: string) => apiClient.get<CmsPage>(`/cms/pages/id/${id}`),
	createPage: (data: Partial<CmsPage>) => apiClient.post<CmsPage>('/cms/pages', data),
	updatePage: (id: string, data: Partial<CmsPage>) => apiClient.put<CmsPage>(`/cms/pages/${id}`, data),
	deletePage: (id: string) => apiClient.delete(`/cms/pages/${id}`),
	publishPage: (id: string) => apiClient.put(`/cms/pages/${id}/publish`, {}),
	unpublishPage: (id: string) => apiClient.put(`/cms/pages/${id}/unpublish`, {}),
};
