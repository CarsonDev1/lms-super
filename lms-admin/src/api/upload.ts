import apiClient from '@/api/client';

export interface UploadResponse {
	url: string;
}

export const uploadApi = {
	uploadImage: (file: File) => {
		const formData = new FormData();
		formData.append('image', file);

		return apiClient.post<UploadResponse>('/upload/image', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},
};
