import express from 'express';
import {
	getAuditLogs,
	getAuditLogById,
	getResourceAuditLogs,
	getUserActivityLogs,
	cleanupAuditLogs,
} from '../middlewares/auditLog.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs (Admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, read, login, logout]
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 */
router.get('/', getAuditLogs);

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Get audit log by ID (Admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 */
router.get('/:id', getAuditLogById);

/**
 * @swagger
 * /api/audit-logs/resource/{resourceType}/{resourceId}:
 *   get:
 *     summary: Get audit logs for a specific resource (Admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of resource (e.g., User, Course, Order)
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource audit logs retrieved
 */
router.get('/resource/:resourceType/:resourceId', getResourceAuditLogs);

/**
 * @swagger
 * /api/audit-logs/user/{userId}:
 *   get:
 *     summary: Get user activity logs (Admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: User activity logs retrieved
 */
router.get('/user/:userId', getUserActivityLogs);

/**
 * @swagger
 * /api/audit-logs/cleanup:
 *   delete:
 *     summary: Cleanup old audit logs (Admin)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: olderThanDays
 *         schema:
 *           type: number
 *           default: 90
 *         description: Delete logs older than this many days
 *     responses:
 *       200:
 *         description: Cleanup completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 */
router.delete('/cleanup', cleanupAuditLogs);

export default router;
