import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
	try {
		// User statistics
		const totalUsers = await User.countDocuments();
		const totalStudents = await User.countDocuments({ role: 'student' });
		const totalInstructors = await User.countDocuments({ role: 'instructor' });
		const onlineUsers = await User.countDocuments({ isOnline: true });

		// Course statistics
		const totalCourses = await Course.countDocuments();
		const publishedCourses = await Course.countDocuments({ status: 'published' });
		const pendingCourses = await Course.countDocuments({ status: 'pending' });
		const draftCourses = await Course.countDocuments({ status: 'draft' });

		// Enrollment statistics
		const totalEnrollments = await Enrollment.countDocuments();
		const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
		const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

		// Revenue statistics
		const revenueData = await Order.aggregate([
			{ $match: { status: 'paid' } },
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: '$finalAmount' },
					totalOrders: { $sum: 1 },
					averageOrderValue: { $avg: '$finalAmount' },
				},
			},
		]);

		const revenue = revenueData[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };

		// Recent orders
		const recentOrders = await Order.find()
			.sort({ createdAt: -1 })
			.limit(10)
			.populate('userId', 'name email')
			.populate('courseId', 'title');

		// Top courses by enrollment
		const topCourses = await Course.find({ status: 'published' })
			.sort({ studentsEnrolled: -1 })
			.limit(10)
			.select('title studentsEnrolled ratings price thumbnail');

		// Monthly revenue (last 12 months)
		const monthlyRevenue = await Order.aggregate([
			{
				$match: {
					status: 'paid',
					createdAt: {
						$gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
					},
				},
			},
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					revenue: { $sum: '$finalAmount' },
					orders: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		res.status(200).json({
			success: true,
			data: {
				users: {
					total: totalUsers,
					students: totalStudents,
					instructors: totalInstructors,
					online: onlineUsers,
				},
				courses: {
					total: totalCourses,
					published: publishedCourses,
					pending: pendingCourses,
					draft: draftCourses,
				},
				enrollments: {
					total: totalEnrollments,
					active: activeEnrollments,
					completed: completedEnrollments,
				},
				revenue: {
					total: revenue.totalRevenue,
					totalOrders: revenue.totalOrders,
					averageOrderValue: revenue.averageOrderValue,
				},
				recentOrders,
				topCourses,
				monthlyRevenue,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch dashboard statistics',
		});
	}
};

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
export const getAllUsers = async (req, res) => {
	try {
		const { page = 1, limit = 20, role, search } = req.query;

		const query = {};
		if (role) query.role = role;
		if (search) {
			query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
		}

		const skip = (page - 1) * limit;

		const users = await User.find(query)
			.select('-password')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await User.countDocuments(query);

		res.status(200).json({
			success: true,
			data: {
				users,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch users',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user detail (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: User details with statistics
 */
export const getUserDetail = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Get user statistics
		const enrollments = await Enrollment.countDocuments({ userId });
		const completedCourses = await Enrollment.countDocuments({ 
			userId, 
			status: 'completed' 
		});
		const orders = await Order.countDocuments({ userId });
		const totalSpent = await Order.aggregate([
			{ $match: { userId: user._id, status: 'paid' } },
			{ $group: { _id: null, total: { $sum: '$finalAmount' } } },
		]);

		// If instructor, get instructor statistics
		let instructorStats = null;
		if (user.role === 'instructor') {
			const courses = await Course.countDocuments({ instructor: userId });
			const publishedCourses = await Course.countDocuments({ 
				instructor: userId, 
				status: 'published' 
			});
			const totalStudents = await Course.aggregate([
				{ $match: { instructor: user._id } },
				{ $group: { _id: null, total: { $sum: '$studentsEnrolled' } } },
			]);
			const revenue = await Order.aggregate([
				{
					$lookup: {
						from: 'courses',
						localField: 'courseId',
						foreignField: '_id',
						as: 'course',
					},
				},
				{ $unwind: '$course' },
				{ $match: { 'course.instructor': user._id, status: 'paid' } },
				{ $group: { _id: null, total: { $sum: '$finalAmount' } } },
			]);

			instructorStats = {
				totalCourses: courses,
				publishedCourses,
				totalStudents: totalStudents[0]?.total || 0,
				totalRevenue: revenue[0]?.total || 0,
			};
		}

		res.status(200).json({
			success: true,
			data: {
				user,
				statistics: {
					enrollments,
					completedCourses,
					orders,
					totalSpent: totalSpent[0]?.total || 0,
				},
				instructorStats,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch user details',
		});
	}
};

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 */
export const createUser = async (req, res) => {
	try {
		const { name, email, password, role, phone, bio, avatar } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'Email already exists',
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			role,
			phone,
			bio,
			avatar,
			isEmailVerified: true, // Admin-created users are auto-verified
		});

		// Send welcome email
		try {
			const EmailService = (await import('../services/emailService.js')).default;
			const emailService = new EmailService();
			await emailService.sendWelcomeEmail(user.email, user.name);
		} catch (emailError) {
			console.error('Failed to send welcome email:', emailError);
		}

		res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create user',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 */
export const updateUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const updates = req.body;

		// Prevent password update through this endpoint
		delete updates.password;

		const user = await User.findByIdAndUpdate(userId, updates, {
			new: true,
			runValidators: true,
		}).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'User updated successfully',
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted
 */
export const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findByIdAndDelete(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// TODO: Clean up related data (enrollments, orders, etc.)

		res.status(200).json({
			success: true,
			message: 'User deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete user',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/{userId}/block:
 *   put:
 *     summary: Block or unblock user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User blocked/unblocked successfully
 */
export const toggleBlockUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isBlocked, reason } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Prevent blocking admin users
		if (user.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Cannot block admin users',
			});
		}

		user.isBlocked = isBlocked;
		if (isBlocked && reason) {
			user.blockReason = reason;
		} else {
			user.blockReason = undefined;
		}

		await user.save();

		res.status(200).json({
			success: true,
			message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
			data: {
				_id: user._id,
				name: user.name,
				email: user.email,
				isBlocked: user.isBlocked,
				blockReason: user.blockReason,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user block status',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               sendEmail:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
export const resetUserPassword = async (req, res) => {
	try {
		const { userId } = req.params;
		const { newPassword, sendEmail: shouldSendEmail = true } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Generate random password if not provided
		const passwordToSet = newPassword || crypto.randomBytes(8).toString('hex');

		// Hash password
		const hashedPassword = await bcrypt.hash(passwordToSet, 10);
		user.password = hashedPassword;
		await user.save();

		// Send email with new password
		if (shouldSendEmail) {
			try {
				const EmailService = (await import('../services/emailService.js')).default;
				const emailService = new EmailService();
				await emailService.sendEmail({
					to: user.email,
					subject: 'Password Reset by Administrator',
					html: `
						<h1>Password Reset</h1>
						<p>Hello ${user.name},</p>
						<p>Your password has been reset by an administrator.</p>
						<p><strong>New Password:</strong> ${passwordToSet}</p>
						<p>Please login and change your password immediately.</p>
						<p>Best regards,<br>LMS Team</p>
					`,
					text: `Hello ${user.name},\n\nYour password has been reset by an administrator.\n\nNew Password: ${passwordToSet}\n\nPlease login and change your password immediately.\n\nBest regards,\nLMS Team`,
				});
			} catch (emailError) {
				console.error('Failed to send password reset email:', emailError);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Password reset successfully',
			data: {
				temporaryPassword: newPassword ? undefined : passwordToSet,
				emailSent: shouldSendEmail,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to reset password',
		});
	}
};

/**
 * @swagger
 * /api/admin/users/statistics:
 *   get:
 *     summary: Get detailed user statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
export const getUserStatistics = async (req, res) => {
	try {
		// Total users by role
		const usersByRole = await User.aggregate([
			{
				$group: {
					_id: '$role',
					count: { $sum: 1 },
				},
			},
		]);

		// New users trend (last 12 months)
		const newUsersTrend = await User.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
					},
				},
			},
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		// Active users (logged in last 30 days)
		const activeUsers = await User.countDocuments({
			lastLogin: {
				$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			},
		});

		// Blocked users
		const blockedUsers = await User.countDocuments({ isBlocked: true });

		// Email verified users
		const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

		// Top instructors by revenue
		const topInstructors = await Order.aggregate([
			{ $match: { status: 'paid' } },
			{
				$lookup: {
					from: 'courses',
					localField: 'courseId',
					foreignField: '_id',
					as: 'course',
				},
			},
			{ $unwind: '$course' },
			{
				$group: {
					_id: '$course.instructor',
					totalRevenue: { $sum: '$finalAmount' },
					totalOrders: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'instructor',
				},
			},
			{ $unwind: '$instructor' },
			{
				$project: {
					name: '$instructor.name',
					email: '$instructor.email',
					avatar: '$instructor.avatar',
					totalRevenue: 1,
					totalOrders: 1,
				},
			},
			{ $sort: { totalRevenue: -1 } },
			{ $limit: 10 },
		]);

		// Top students by spending
		const topStudents = await Order.aggregate([
			{ $match: { status: 'paid' } },
			{
				$group: {
					_id: '$userId',
					totalSpent: { $sum: '$finalAmount' },
					totalOrders: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'student',
				},
			},
			{ $unwind: '$student' },
			{
				$project: {
					name: '$student.name',
					email: '$student.email',
					avatar: '$student.avatar',
					totalSpent: 1,
					totalOrders: 1,
				},
			},
			{ $sort: { totalSpent: -1 } },
			{ $limit: 10 },
		]);

		res.status(200).json({
			success: true,
			data: {
				overview: {
					total: await User.countDocuments(),
					byRole: usersByRole,
					active: activeUsers,
					blocked: blockedUsers,
					verified: verifiedUsers,
					online: await User.countDocuments({ isOnline: true }),
				},
				trends: {
					newUsers: newUsersTrend,
				},
				topPerformers: {
					instructors: topInstructors,
					students: topStudents,
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch user statistics',
		});
	}
};

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Get detailed revenue report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue report
 */
export const getRevenueReport = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;

		const matchQuery = { status: 'paid' };
		if (startDate || endDate) {
			matchQuery.createdAt = {};
			if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
			if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
		}

		const revenueByPaymentMethod = await Order.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: '$paymentMethod',
					revenue: { $sum: '$finalAmount' },
					orders: { $sum: 1 },
				},
			},
		]);

		const revenueByInstructor = await Order.aggregate([
			{ $match: matchQuery },
			{
				$lookup: {
					from: 'courses',
					localField: 'courseId',
					foreignField: '_id',
					as: 'course',
				},
			},
			{ $unwind: '$course' },
			{
				$group: {
					_id: '$course.instructor',
					revenue: { $sum: '$finalAmount' },
					orders: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'instructor',
				},
			},
			{ $unwind: '$instructor' },
			{
				$project: {
					instructor: { name: '$instructor.name', email: '$instructor.email' },
					revenue: 1,
					orders: 1,
				},
			},
			{ $sort: { revenue: -1 } },
			{ $limit: 20 },
		]);

		const dailyRevenue = await Order.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
						day: { $dayOfMonth: '$createdAt' },
					},
					revenue: { $sum: '$finalAmount' },
					orders: { $sum: 1 },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
		]);

		res.status(200).json({
			success: true,
			data: {
				byPaymentMethod: revenueByPaymentMethod,
				byInstructor: revenueByInstructor,
				daily: dailyRevenue,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch revenue report',
		});
	}
};

/**
 * @swagger
 * /api/admin/courses/pending:
 *   get:
 *     summary: Get pending courses for review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending courses
 */
export const getPendingCourses = async (req, res) => {
	try {
		const courses = await Course.find({ status: 'pending' })
			.populate('instructor', 'name email avatar')
			.populate('categoryId', 'name')
			.populate('levelId', 'name')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: courses,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch pending courses',
		});
	}
};

export default {
	getDashboardStats,
	getAllUsers,
	getUserDetail,
	createUser,
	updateUser,
	deleteUser,
	toggleBlockUser,
	resetUserPassword,
	getUserStatistics,
	getRevenueReport,
	getPendingCourses,
};
