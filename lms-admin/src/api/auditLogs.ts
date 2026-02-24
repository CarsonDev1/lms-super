import apiClient from '@/api/client';

export interface AuditLog {
	_id: string;
	action: string;
	userId: {
		_id: string;
		name: string;
		email: string;
	};
	resourceType: string;
	resourceId?: string;
	details?: any;
	ipAddress?: string;
	createdAt: string;
}

export const auditLogsApi = {
	getAuditLogs: (params?: { page?: number; limit?: number }) => apiClient.get<AuditLog[]>('/audit-logs', { params }),
	getAuditLogById: (id: string) => apiClient.get<AuditLog>(`/audit-logs/${id}`),
};
