import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				success: false,
				message: 'Access token is required',
			});
		}

		const token = authHeader.split(' ')[1];

		// Verify token
		const decoded = jwt.verify(token, jwtConfig.accessTokenSecret, {
			issuer: jwtConfig.issuer,
			audience: jwtConfig.audience,
		});

		// Get user from database
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found',
			});
		}

		// Check if user is blocked
		if (user.isBlocked) {
			return res.status(403).json({
				success: false,
				message: 'Your account has been blocked',
				reason: user.blockReason,
			});
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: 'Your account has been deactivated',
			});
		}

		// Attach user to request
		req.user = user;
		next();
	} catch (error) {
		logger.error('Authentication error:', error);

		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: 'Token expired',
			});
		}

		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				success: false,
				message: 'Invalid token',
			});
		}

		return res.status(401).json({
			success: false,
			message: 'Authentication failed',
		});
	}
};

/**
 * Middleware to authorize user roles
 */
export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to perform this action',
			});
		}

		next();
	};
};

/**
 * Middleware to check specific permissions
 */
export const checkPermission = (...permissions) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			});
		}

		// Admin has all permissions
		if (req.user.role === 'admin') {
			return next();
		}

		// Check if user has any of the required permissions
		const hasPermission = permissions.some((permission) => req.user.permissions?.includes(permission));

		if (!hasPermission) {
			return res.status(403).json({
				success: false,
				message: 'You do not have the required permissions',
			});
		}

		next();
	};
};

/**
 * Middleware to check if user owns the resource or has permission
 */
export const checkOwnership = (model) => {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized',
				});
			}

			// Admin can access everything
			if (req.user.role === 'admin') {
				return next();
			}

			const resourceId = req.params.id || req.params.courseId;
			const Model = await import(`../models/${model}.js`);
			const resource = await Model.default.findById(resourceId);

			if (!resource) {
				return res.status(404).json({
					success: false,
					message: `${model} not found`,
				});
			}

			// Check if user owns the resource
			const ownerField = model === 'Course' ? 'instructor' : 'userId';
			if (resource[ownerField]?.toString() !== req.user._id.toString()) {
				return res.status(403).json({
					success: false,
					message: 'You do not have permission to access this resource',
				});
			}

			req.resource = resource;
			next();
		} catch (error) {
			logger.error('Ownership check error:', error);
			return res.status(500).json({
				success: false,
				message: 'Failed to verify ownership',
			});
		}
	};
};

/**
 * Middleware for course workflow permissions
 */
export const checkCourseWorkflowPermission = (action) => {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized',
				});
			}

			const { role, permissions } = req.user;
			const courseId = req.params.id || req.params.courseId;

			// Define action-permission mapping
			const actionPermissions = {
				create: ['course:create'],
				update_draft: ['course:update:own'],
				submit: ['course:submit'],
				review: ['course:review'],
				approve: ['course:approve'],
				reject: ['course:reject'],
				publish: ['course:publish'],
				unpublish: ['course:unpublish'],
				archive: ['course:archive'],
			};

			// Admin has all permissions
			if (role === 'admin') {
				return next();
			}

			// Check if action exists
			const requiredPermissions = actionPermissions[action];
			if (!requiredPermissions) {
				return res.status(400).json({
					success: false,
					message: 'Invalid action',
				});
			}

			// For update_draft and submit, check if user owns the course
			if (['update_draft', 'submit'].includes(action) && courseId) {
				const Course = (await import('../models/Course.js')).default;
				const course = await Course.findById(courseId);

				if (!course) {
					return res.status(404).json({
						success: false,
						message: 'Course not found',
					});
				}

				if (course.instructor.toString() !== req.user._id.toString()) {
					return res.status(403).json({
						success: false,
						message: 'You can only modify your own courses',
					});
				}

				req.course = course;
			}

			// Check if user has required permissions
			const hasPermission = requiredPermissions.some((perm) => permissions?.includes(perm));

			if (!hasPermission) {
				return res.status(403).json({
					success: false,
					message: `You do not have permission to ${action.replace('_', ' ')} courses`,
				});
			}

			next();
		} catch (error) {
			logger.error('Course workflow permission error:', error);
			return res.status(500).json({
				success: false,
				message: 'Failed to verify permissions',
			});
		}
	};
};

export default { authenticate, authorize, checkPermission, checkOwnership, checkCourseWorkflowPermission };
