import express from 'express';
import {
	getPages,
	getPageBySlug,
	getPageById,
	createPage,
	updatePage,
	publishPage,
	unpublishPage,
	deletePage,
	getMenuPages,
} from '../controllers/cmsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/cms/pages:
 *   get:
 *     summary: Get all CMS pages
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *     responses:
 *       200:
 *         description: Pages retrieved successfully
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
 *                     $ref: '#/components/schemas/CMSPage'
 */
router.get('/pages', getPages);

/**
 * @swagger
 * /api/cms/pages/{slug}:
 *   get:
 *     summary: Get CMS page by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug (e.g., about-us)
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CMSPage'
 */
router.get('/pages/:slug', getPageBySlug);

/**
 * @swagger
 * /api/cms/menu:
 *   get:
 *     summary: Get pages to show in menu
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Menu pages retrieved successfully
 */
router.get('/menu', getMenuPages);

// Admin routes
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/cms/pages/id/{id}:
 *   get:
 *     summary: Get CMS page by ID (Admin)
 *     tags: [CMS]
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
 *         description: Page retrieved successfully
 */
router.get('/pages/id/:id', getPageById);

/**
 * @swagger
 * /api/cms/pages:
 *   post:
 *     summary: Create a new CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: About Us
 *               slug:
 *                 type: string
 *                 example: about-us
 *               content:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               showInMenu:
 *                 type: boolean
 *               menuOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: Page created successfully
 */
router.post('/pages', createPage);

/**
 * @swagger
 * /api/cms/pages/{id}:
 *   put:
 *     summary: Update a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: Page updated successfully
 *   delete:
 *     summary: Delete a CMS page
 *     tags: [CMS]
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
 *         description: Page deleted successfully
 */
router.put('/pages/:id', updatePage);

/**
 * @swagger
 * /api/cms/pages/{id}/publish:
 *   put:
 *     summary: Publish a CMS page
 *     tags: [CMS]
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
 *         description: Page published successfully
 */
router.put('/pages/:id/publish', publishPage);

/**
 * @swagger
 * /api/cms/pages/{id}/unpublish:
 *   put:
 *     summary: Unpublish a CMS page
 *     tags: [CMS]
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
 *         description: Page unpublished successfully
 */
router.put('/pages/:id/unpublish', unpublishPage);

router.delete('/pages/:id', deletePage);

export default router;
