import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to log audit events
 */
export const auditLog = (action, category, resourceType) => {
	return async (req, res, next) => {
		// Store original json method
		const originalJson = res.json.bind(res);

		// Override json method to capture response
		res.json = function (data) {
			// Log audit after response is sent
			setImmediate(async () => {
				try {
					await AuditLog.create({
						userId: req.user?._id,
						action,
						category,
						resourceType,
						resourceId: req.params.id || data?.data?._id,
						description: `${action} ${resourceType}`,
						details: {
							body: req.body,
							params: req.params,
							query: req.query,
						},
						metadata: {
							ip: req.ip,
							userAgent: req.get('user-agent'),
							method: req.method,
							path: req.path,
							statusCode: res.statusCode,
						},
						severity: getSeverity(action),
						status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
					});
				} catch (error) {
					console.error('Audit log error:', error);
				}
			});

			// Call original json method
			return originalJson(data);
		};

		next();
	};
};

/**
 * Middleware to log changes (before/after)
 */
export const auditChanges = (action, category, resourceType) => {
	return async (req, res, next) => {
		// Get original data before update
		let originalData = null;
		if (req.params.id && ['update', 'delete'].includes(action)) {
			try {
				// Dynamically import model based on resourceType
				const modelName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
				const Model = (await import(`../models/${modelName}.js`)).default;
				originalData = await Model.findById(req.params.id).lean();
			} catch (error) {
				console.error('Error fetching original data:', error);
			}
		}

		// Store original json method
		const originalJson = res.json.bind(res);

		// Override json method
		res.json = function (data) {
			// Log audit with changes
			setImmediate(async () => {
				try {
					await AuditLog.create({
						userId: req.user?._id,
						action,
						category,
						resourceType,
						resourceId: req.params.id || data?.data?._id,
						description: `${action} ${resourceType}`,
						details: {
							body: req.body,
							params: req.params,
							query: req.query,
						},
						changes: {
							before: originalData,
							after: data?.data,
						},
						metadata: {
							ip: req.ip,
							userAgent: req.get('user-agent'),
							method: req.method,
							path: req.path,
							statusCode: res.statusCode,
						},
						severity: getSeverity(action),
						status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
					});
				} catch (error) {
					console.error('Audit log error:', error);
				}
			});

			return originalJson(data);
		};

		next();
	};
};

/**
 * Get audit logs
 * @route   GET /api/audit-logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res) => {
	const { category, action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;

	const filter = {};
	if (category) filter.category = category;
	if (action) filter.action = action;
	if (userId) filter.userId = userId;
	if (startDate || endDate) {
		filter.timestamp = {};
		if (startDate) filter.timestamp.$gte = new Date(startDate);
		if (endDate) filter.timestamp.$lte = new Date(endDate);
	}

	const logs = await AuditLog.find(filter)
		.populate('userId', 'name email')
		.sort('-timestamp')
		.limit(parseInt(limit))
		.skip((parseInt(page) - 1) * parseInt(limit));

	const total = await AuditLog.countDocuments(filter);

	res.json({
		success: true,
		count: logs.length,
		total,
		page: parseInt(page),
		pages: Math.ceil(total / parseInt(limit)),
		data: logs,
	});
};

/**
 * Get audit log by ID
 * @route   GET /api/audit-logs/:id
 * @access  Private/Admin
 */
export const getAuditLogById = async (req, res) => {
	const log = await AuditLog.findById(req.params.id).populate('userId', 'name email avatar');

	if (!log) {
		return res.status(404).json({ message: 'Audit log not found' });
	}

	res.json({
		success: true,
		data: log,
	});
};

/**
 * Get audit logs for specific resource
 * @route   GET /api/audit-logs/resource/:resourceType/:resourceId
 * @access  Private/Admin
 */
export const getResourceAuditLogs = async (req, res) => {
	const { resourceType, resourceId } = req.params;

	const logs = await AuditLog.find({
		resourceType,
		resourceId,
	})
		.populate('userId', 'name email')
		.sort('-timestamp');

	res.json({
		success: true,
		count: logs.length,
		data: logs,
	});
};

/**
 * Get user activity logs
 * @route   GET /api/audit-logs/user/:userId
 * @access  Private/Admin
 */
export const getUserActivityLogs = async (req, res) => {
	const { userId } = req.params;
	const { limit = 100 } = req.query;

	const logs = await AuditLog.find({ userId }).sort('-timestamp').limit(parseInt(limit));

	res.json({
		success: true,
		count: logs.length,
		data: logs,
	});
};

/**
 * Delete old audit logs
 * @route   DELETE /api/audit-logs/cleanup
 * @access  Private/Admin
 */
export const cleanupAuditLogs = async (req, res) => {
	const { daysOld = 90 } = req.body;

	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

	const result = await AuditLog.deleteMany({
		timestamp: { $lt: cutoffDate },
	});

	res.json({
		success: true,
		message: `Deleted ${result.deletedCount} audit logs older than ${daysOld} days`,
		deletedCount: result.deletedCount,
	});
};

// Helper function
const getSeverity = (action) => {
	const criticalActions = ['delete', 'ban', 'suspend'];
	const warningActions = ['update', 'reject', 'refund'];
	const infoActions = ['view', 'list', 'search'];

	if (criticalActions.includes(action)) return 'critical';
	if (warningActions.includes(action)) return 'warning';
	if (infoActions.includes(action)) return 'info';
	return 'info';
};

export default {
	auditLog,
	auditChanges,
	getAuditLogs,
	getAuditLogById,
	getResourceAuditLogs,
	getUserActivityLogs,
	cleanupAuditLogs,
};
