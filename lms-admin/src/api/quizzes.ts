import apiClient from '@/api/client';

export interface Quiz {
	_id: string;
	title: string;
	courseId: string | { _id: string; title: string };
	description?: string;
	duration?: number; // in minutes
	timeLimit?: number;
	passingScore: number;
	maxAttempts?: number;
	questions: any[];
	isActive: boolean;
	isPublished?: boolean;
	difficulty?: 'easy' | 'medium' | 'hard';
	totalAttempts?: number;
	createdAt: string;
}

export const quizzesApi = {
	// Get all quizzes for the current instructor (using my-courses filter)
	getQuizzes: (params?: { page?: number; limit?: number; courseId?: string }) =>
		apiClient.get<Quiz[]>('/quizzes', { params }),
	getQuizzesByCourse: (courseId: string) => apiClient.get<Quiz[]>(`/quizzes/course/${courseId}`),
	getQuizById: (id: string) => apiClient.get<Quiz>(`/quizzes/${id}`),
	createQuiz: (data: Partial<Quiz>) => apiClient.post<Quiz>('/quizzes', data),
	updateQuiz: (id: string, data: Partial<Quiz>) => apiClient.put<Quiz>(`/quizzes/${id}`, data),
	deleteQuiz: (id: string) => apiClient.delete(`/quizzes/${id}`),
	submitAttempt: (quizId: string, data: { answers: any[] }) => apiClient.post(`/quizzes/${quizId}/submit`, data),
	getAttempts: (quizId: string) => apiClient.get(`/quizzes/${quizId}/attempts`),
};
