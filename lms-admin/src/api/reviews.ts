import apiClient from '@/api/client';

export interface Review {
	_id: string;
	userId: { _id: string; name: string; email: string; avatar?: string };
	courseId: { _id: string; title: string; thumbnail?: string };
	rating: number;
	review?: string;
	isVerifiedPurchase: boolean;
	helpfulCount: number;
	instructorReply?: { message: string; repliedAt: string };
	createdAt: string;
}

export const reviewsApi = {
	getAllReviews: (params?: { page?: number; limit?: number; rating?: number }) =>
		apiClient.get<any>('/admin/reviews', { params }),
	deleteReview: (id: string) => apiClient.delete(`/admin/reviews/${id}`),
};
