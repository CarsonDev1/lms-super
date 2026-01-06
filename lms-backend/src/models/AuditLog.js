import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		action: {
			type: String,
			required: true,
			index: true,
		},
		category: {
			type: String,
			enum: ['auth', 'user', 'course', 'enrollment', 'payment', 'admin', 'content', 'system'],
			required: true,
			index: true,
		},
		resourceType: {
			type: String,
			required: true,
		},
		resourceId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		description: {
			type: String,
			required: true,
		},
		details: {
			type: mongoose.Schema.Types.Mixed,
		},
		changes: {
			before: {
				type: mongoose.Schema.Types.Mixed,
			},
			after: {
				type: mongoose.Schema.Types.Mixed,
			},
		},
		metadata: {
			ip: {
				type: String,
			},
			userAgent: {
				type: String,
			},
			method: {
				type: String,
			},
			path: {
				type: String,
			},
			statusCode: {
				type: Number,
			},
		},
		severity: {
			type: String,
			enum: ['info', 'warning', 'error', 'critical'],
			default: 'info',
		},
		status: {
			type: String,
			enum: ['success', 'failure', 'pending'],
			default: 'success',
		},
		timestamp: {
			type: Date,
			default: Date.now,
			index: true,
		},
	},
	{
		timestamps: false,
	}
);

// Indexes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, action: 1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - auto-delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
