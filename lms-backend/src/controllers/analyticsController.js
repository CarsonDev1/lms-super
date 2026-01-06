import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import UserProgress from '../models/UserProgress.js';

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/analytics/admin/dashboard
 * @access  Private/Admin
 */
export const getAdminDashboard = async (req, res) => {
	const { startDate, endDate } = req.query;

	const dateFilter = {};
	if (startDate && endDate) {
		dateFilter.createdAt = {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		};
	}

	// Users statistics
	const totalUsers = await User.countDocuments();
	const activeUsers = await User.countDocuments({ isActive: true });
	const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

	// Courses statistics
	const totalCourses = await Course.countDocuments();
	const publishedCourses = await Course.countDocuments({ status: 'published' });
	const draftCourses = await Course.countDocuments({ status: 'draft' });

	// Enrollments statistics
	const totalEnrollments = await Enrollment.countDocuments(dateFilter);
	const activeEnrollments = await Enrollment.countDocuments({
		...dateFilter,
		status: 'active',
	});
	const completedEnrollments = await Enrollment.countDocuments({
		...dateFilter,
		status: 'completed',
	});

	// Revenue statistics
	const revenueData = await Order.aggregate([
		{ $match: { status: 'completed', ...dateFilter } },
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: '$amount' },
				totalOrders: { $sum: 1 },
				averageOrderValue: { $avg: '$amount' },
			},
		},
	]);

	const revenue = revenueData[0] || {
		totalRevenue: 0,
		totalOrders: 0,
		averageOrderValue: 0,
	};

	// Revenue by month
	const revenueByMonth = await Order.aggregate([
		{ $match: { status: 'completed' } },
		{
			$group: {
				_id: {
					year: { $year: '$createdAt' },
					month: { $month: '$createdAt' },
				},
				revenue: { $sum: '$amount' },
				orders: { $sum: 1 },
			},
		},
		{ $sort: { '_id.year': -1, '_id.month': -1 } },
		{ $limit: 12 },
	]);

	// Popular courses
	const popularCourses = await Course.aggregate([
		{
			$lookup: {
				from: 'enrollments',
				localField: '_id',
				foreignField: 'courseId',
				as: 'enrollments',
			},
		},
		{
			$project: {
				title: 1,
				thumbnail: 1,
				enrollmentCount: { $size: '$enrollments' },
			},
		},
		{ $sort: { enrollmentCount: -1 } },
		{ $limit: 10 },
	]);

	res.json({
		success: true,
		data: {
			users: {
				total: totalUsers,
				active: activeUsers,
				byRole: usersByRole,
			},
			courses: {
				total: totalCourses,
				published: publishedCourses,
				draft: draftCourses,
			},
			enrollments: {
				total: totalEnrollments,
				active: activeEnrollments,
				completed: completedEnrollments,
			},
			revenue: {
				...revenue,
				byMonth: revenueByMonth,
			},
			popularCourses,
		},
	});
};

/**
 * @desc    Get instructor dashboard statistics
 * @route   GET /api/analytics/instructor/dashboard
 * @access  Private/Instructor
 */
export const getInstructorDashboard = async (req, res) => {
	const instructorId = req.user._id;

	// Courses statistics
	const totalCourses = await Course.countDocuments({ instructor: instructorId });
	const publishedCourses = await Course.countDocuments({
		instructor: instructorId,
		status: 'published',
	});

	// Enrollments statistics
	const courses = await Course.find({ instructor: instructorId }).select('_id');
	const courseIds = courses.map((c) => c._id);

	const totalEnrollments = await Enrollment.countDocuments({
		courseId: { $in: courseIds },
	});
	const activeEnrollments = await Enrollment.countDocuments({
		courseId: { $in: courseIds },
		status: 'active',
	});

	// Revenue statistics
	const revenueData = await Order.aggregate([
		{
			$match: {
				courseId: { $in: courseIds },
				status: 'completed',
			},
		},
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: '$amount' },
				totalOrders: { $sum: 1 },
			},
		},
	]);

	const revenue = revenueData[0] || { totalRevenue: 0, totalOrders: 0 };

	// Reviews statistics
	const reviewsData = await Review.aggregate([
		{ $match: { courseId: { $in: courseIds } } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: '$rating' },
				totalReviews: { $sum: 1 },
			},
		},
	]);

	const reviews = reviewsData[0] || { averageRating: 0, totalReviews: 0 };

	// Course performance
	const coursePerformance = await Course.aggregate([
		{ $match: { instructor: instructorId } },
		{
			$lookup: {
				from: 'enrollments',
				localField: '_id',
				foreignField: 'courseId',
				as: 'enrollments',
			},
		},
		{
			$lookup: {
				from: 'reviews',
				localField: '_id',
				foreignField: 'courseId',
				as: 'reviews',
			},
		},
		{
			$project: {
				title: 1,
				thumbnail: 1,
				enrollmentCount: { $size: '$enrollments' },
				averageRating: { $avg: '$reviews.rating' },
				totalReviews: { $size: '$reviews' },
			},
		},
		{ $sort: { enrollmentCount: -1 } },
	]);

	// Student engagement
	const engagementData = await Enrollment.aggregate([
		{
			$match: {
				courseId: { $in: courseIds },
				status: { $in: ['active', 'completed'] },
			},
		},
		{
			$group: {
				_id: null,
				averageProgress: { $avg: '$progress' },
				completionRate: {
					$avg: {
						$cond: [{ $eq: ['$status', 'completed'] }, 100, 0],
					},
				},
			},
		},
	]);

	const engagement = engagementData[0] || {
		averageProgress: 0,
		completionRate: 0,
	};

	res.json({
		success: true,
		data: {
			courses: {
				total: totalCourses,
				published: publishedCourses,
			},
			enrollments: {
				total: totalEnrollments,
				active: activeEnrollments,
			},
			revenue,
			reviews,
			coursePerformance,
			engagement,
		},
	});
};

/**
 * @desc    Get student dashboard statistics
 * @route   GET /api/analytics/student/dashboard
 * @access  Private/Student
 */
export const getStudentDashboard = async (req, res) => {
	const userId = req.user._id;

	// Enrollments statistics
	const totalEnrollments = await Enrollment.countDocuments({ userId });
	const activeEnrollments = await Enrollment.countDocuments({
		userId,
		status: 'active',
	});
	const completedEnrollments = await Enrollment.countDocuments({
		userId,
		status: 'completed',
	});

	// Progress statistics
	const enrollments = await Enrollment.find({ userId, status: 'active' })
		.populate('courseId', 'title thumbnail')
		.sort('-lastAccessedAt');

	const averageProgress =
		enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length : 0;

	// Gamification statistics
	const userProgress = await UserProgress.findOne({ userId });

	const gamification = userProgress
		? {
				level: userProgress.level,
				xp: userProgress.xp,
				cups: userProgress.cups,
				currentStreak: userProgress.currentStreak,
				longestStreak: userProgress.longestStreak,
				achievements: userProgress.achievements.length,
				todayProgress: userProgress.todayProgress,
				dailyGoals: userProgress.dailyGoals,
		  }
		: null;

	// Learning time
	const learningTime = userProgress
		? {
				totalMinutes: userProgress.stats.totalLearningMinutes,
				totalHours: Math.floor(userProgress.stats.totalLearningMinutes / 60),
				totalLessons: userProgress.stats.totalLessonsCompleted,
				totalCourses: userProgress.stats.totalCoursesCompleted,
		  }
		: null;

	// Recent activity
	const recentEnrollments = await Enrollment.find({ userId })
		.populate('courseId', 'title thumbnail instructor')
		.sort('-lastAccessedAt')
		.limit(5);

	res.json({
		success: true,
		data: {
			enrollments: {
				total: totalEnrollments,
				active: activeEnrollments,
				completed: completedEnrollments,
				averageProgress: Math.round(averageProgress),
			},
			gamification,
			learningTime,
			activeCourses: enrollments.slice(0, 5),
			recentActivity: recentEnrollments,
		},
	});
};

/**
 * @desc    Get course analytics
 * @route   GET /api/analytics/courses/:courseId
 * @access  Private
 */
export const getCourseAnalytics = async (req, res) => {
	const { courseId } = req.params;

	const course = await Course.findById(courseId);
	if (!course) {
		return res.status(404).json({ message: 'Course not found' });
	}

	// Check authorization
	if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	// Enrollments over time
	const enrollmentsOverTime = await Enrollment.aggregate([
		{ $match: { courseId: course._id } },
		{
			$group: {
				_id: {
					year: { $year: '$createdAt' },
					month: { $month: '$createdAt' },
					day: { $dayOfMonth: '$createdAt' },
				},
				count: { $sum: 1 },
			},
		},
		{ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
		{ $limit: 30 },
	]);

	// Completion rate
	const totalEnrollments = await Enrollment.countDocuments({ courseId });
	const completedEnrollments = await Enrollment.countDocuments({
		courseId,
		status: 'completed',
	});
	const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

	// Average progress
	const progressData = await Enrollment.aggregate([
		{ $match: { courseId: course._id } },
		{ $group: { _id: null, averageProgress: { $avg: '$progress' } } },
	]);
	const averageProgress = progressData[0]?.averageProgress || 0;

	// Reviews
	const reviewsData = await Review.aggregate([
		{ $match: { courseId: course._id } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: '$rating' },
				totalReviews: { $sum: 1 },
			},
		},
	]);
	const reviews = reviewsData[0] || { averageRating: 0, totalReviews: 0 };

	// Rating distribution
	const ratingDistribution = await Review.aggregate([
		{ $match: { courseId: course._id } },
		{ $group: { _id: '$rating', count: { $sum: 1 } } },
		{ $sort: { _id: -1 } },
	]);

	res.json({
		success: true,
		data: {
			courseId,
			enrollments: {
				total: totalEnrollments,
				completed: completedEnrollments,
				completionRate: Math.round(completionRate),
				overTime: enrollmentsOverTime,
			},
			progress: {
				average: Math.round(averageProgress),
			},
			reviews: {
				...reviews,
				distribution: ratingDistribution,
			},
		},
	});
};

/**
 * @desc    Export analytics data
 * @route   GET /api/analytics/export
 * @access  Private/Admin
 */
export const exportAnalytics = async (req, res) => {
	const { type, startDate, endDate } = req.query;

	// This would generate CSV/Excel file
	// For now, return JSON data

	let data;
	switch (type) {
		case 'users':
			data = await User.find().select('-password').lean();
			break;
		case 'courses':
			data = await Course.find().populate('instructor', 'name email').lean();
			break;
		case 'enrollments':
			data = await Enrollment.find().populate('userId', 'name email').populate('courseId', 'title').lean();
			break;
		case 'orders':
			data = await Order.find().populate('userId', 'name email').lean();
			break;
		default:
			return res.status(400).json({ message: 'Invalid export type' });
	}

	res.json({
		success: true,
		type,
		count: data.length,
		data,
	});
};

export default {
	getAdminDashboard,
	getInstructorDashboard,
	getStudentDashboard,
	getCourseAnalytics,
	exportAnalytics,
};
