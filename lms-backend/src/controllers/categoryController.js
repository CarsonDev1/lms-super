import Category from '../models/Category.js';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
export const getCategories = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const categories = await Category.find().sort({ name: 1 });
		res.status(200).json({
			success: true,
			data: {
				categories,
				pagination: { page: parseInt(page), limit: parseInt(limit), total: categories.length },
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get categories',
		});
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
export const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			});
		}
		res.status(200).json({
			success: true,
			data: category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get category',
		});
	}
};

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Programming
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const createCategory = async (req, res) => {
	try {
		const { name } = req.body;
		const category = await Category.create({ name });
		res.status(201).json({
			success: true,
			message: 'Category created successfully',
			data: category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create category',
		});
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Design
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			});
		}
		category.name = name || category.name;
		await category.save();
		res.status(200).json({
			success: true,
			message: 'Category updated successfully',
			data: category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update category',
		});
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByIdAndDelete(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Category deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete category',
			error: error.message,
		});
	}
};
