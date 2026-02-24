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
	getAchievements: () => apiClient.get<Achievement[]>('/gamification/achievements'),
	createAchievement: (data: Partial<Achievement>) => apiClient.post<Achievement>('/gamification/achievements', data),
	getLeaderboard: () => apiClient.get<any>('/gamification/leaderboard'),
};
