import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users/statistics', getUserStatistics);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:userId', getUserDetail);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/block', toggleBlockUser);
router.post('/users/:userId/reset-password', resetUserPassword);

// Revenue
router.get('/revenue', getRevenueReport);

// Course Management
router.get('/courses/pending', getPendingCourses);

export default router;
