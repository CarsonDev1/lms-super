import apiClient from '@/api/client';

export interface Achievement {
	_id: string;
	name: string;
	description: string;
	icon?: string;
	type: 'course' | 'streak' | 'quiz' | 'social' | 'milestone';
	condition: {
		metric: string;
		threshold: number;
	};
	xpReward: number;
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	isActive: boolean;
	createdAt: string;
}

export const gamificationApi = {
	getAchievements: (params?: { page?: number; limit?: number }) =>
		apiClient.get<Achievement[]>('/gamification/achievements', { params }),
	createAchievement: (data: Partial<Achievement>) =>
		apiClient.post<Achievement>('/gamification/achievements', data),
	updateAchievement: (id: string, data: Partial<Achievement>) =>
		apiClient.put<Achievement>(`/gamification/achievements/${id}`, data),
	deleteAchievement: (id: string) =>
		apiClient.delete(`/gamification/achievements/${id}`),
	getLeaderboard: () => apiClient.get<any>('/gamification/leaderboard'),
};
