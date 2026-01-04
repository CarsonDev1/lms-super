import Course from '../models/Course.js';
import logger from '../config/logger.js';

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: levelId
 *         schema:
 *           type: string
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
 *         description: List of courses
 */
export const getCourses = async (req, res) => {
	try {
		const { categoryId, levelId, page = 1, limit = 10 } = req.query;

		const query = { isPublished: true };

		if (categoryId) query.category = categoryId;
		if (levelId) query.level = levelId;

		const skip = (page - 1) * limit;

		const courses = await Course.find(query)
			.populate('instructor', 'name email')
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 });

		const total = await Course.countDocuments(query);

		res.status(200).json({
			success: true,
			data: {
				courses,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		logger.error('Get courses error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get courses',
		});
	}
};

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
export const getCourseById = async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).populate('instructor', 'name email avatar');

		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		res.status(200).json({
			success: true,
			data: { course },
		});
	} catch (error) {
		logger.error('Get course error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get course',
		});
	}
};

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
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
 *               - description
 *               - category
 *               - price
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created successfully
 */
export const createCourse = async (req, res) => {
	try {
		const courseData = {
			...req.body,
			instructor: req.user._id,
		};

		const course = await Course.create(courseData);

		logger.info(`Course created: ${course.title}`);

		res.status(201).json({
			success: true,
			message: 'Course created successfully',
			data: { course },
		});
	} catch (error) {
		logger.error('Create course error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create course',
		});
	}
};

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 */
export const updateCourse = async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);

		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Check if user is the instructor or admin
		if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to update this course',
			});
		}

		Object.assign(course, req.body);
		await course.save();

		logger.info(`Course updated: ${course.title}`);

		res.status(200).json({
			success: true,
			message: 'Course updated successfully',
			data: { course },
		});
	} catch (error) {
		logger.error('Update course error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update course',
		});
	}
};

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
export const deleteCourse = async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);

		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Check if user is the instructor or admin
		if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to delete this course',
			});
		}

		await course.deleteOne();

		logger.info(`Course deleted: ${course.title}`);

		res.status(200).json({
			success: true,
			message: 'Course deleted successfully',
		});
	} catch (error) {
		logger.error('Delete course error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete course',
		});
	}
};

export default {
	getCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
};
