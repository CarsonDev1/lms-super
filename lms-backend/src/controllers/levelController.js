import Level from '../models/Level.js';

/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Levels]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     levels:
 *                       type: array
 *                     pagination:
 *                       type: object
 */
export const getLevels = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const levels = await Level.find().sort({ order: 1, name: 1 });
		res.status(200).json({
			success: true,
			data: {
				levels,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total: levels.length,
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get levels',
		});
	}
};

/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: Get level by ID
 *     tags: [Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level details
 *       404:
 *         description: Level not found
 */
export const getLevelById = async (req, res) => {
	try {
		const { id } = req.params;
		const level = await Level.findById(id);
		if (!level) {
			return res.status(404).json({
				success: false,
				message: 'Level not found',
			});
		}
		res.status(200).json({
			success: true,
			data: level,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get level',
		});
	}
};

/**
 * @swagger
 * /api/levels:
 *   post:
 *     summary: Create a new level
 *     tags: [Levels]
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
 *                 example: Beginner
 *               description:
 *                 type: string
 *                 example: For beginners with no prior experience
 *               order:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Level created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const createLevel = async (req, res) => {
	try {
		const { name, description, order } = req.body;
		const level = await Level.create({ name, description, order });
		res.status(201).json({
			success: true,
			message: 'Level created successfully',
			data: level,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'Level name already exists',
			});
		}
		res.status(500).json({
			success: false,
			message: 'Failed to create level',
		});
	}
};

/**
 * @swagger
 * /api/levels/{id}:
 *   put:
 *     summary: Update a level
 *     tags: [Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Intermediate
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Level updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Level not found
 *       500:
 *         description: Internal server error
 */
export const updateLevel = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, order, isActive } = req.body;

		const level = await Level.findById(id);
		if (!level) {
			return res.status(404).json({
				success: false,
				message: 'Level not found',
			});
		}

		if (name) level.name = name;
		if (description !== undefined) level.description = description;
		if (order !== undefined) level.order = order;
		if (isActive !== undefined) level.isActive = isActive;

		await level.save();
		res.status(200).json({
			success: true,
			message: 'Level updated successfully',
			data: level,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'Level name already exists',
			});
		}
		res.status(500).json({
			success: false,
			message: 'Failed to update level',
		});
	}
};

/**
 * @swagger
 * /api/levels/{id}:
 *   delete:
 *     summary: Delete a level
 *     tags: [Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level deleted successfully
 *       404:
 *         description: Level not found
 *       500:
 *         description: Internal server error
 */
export const deleteLevel = async (req, res) => {
	try {
		const { id } = req.params;
		const level = await Level.findByIdAndDelete(id);
		if (!level) {
			return res.status(404).json({
				success: false,
				message: 'Level not found',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Level deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete level',
		});
	}
};
