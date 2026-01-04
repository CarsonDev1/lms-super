import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled or invalid course
 */
export const enrollCourse = async (req, res) => {
	try {
		const { courseId } = req.body;
		const userId = req.user._id;

		// Check if course exists and is published
		const course = await Course.findById(courseId);
		if (!course || course.status !== 'published') {
			return res.status(400).json({
				success: false,
				message: 'Course not found or not available',
			});
		}

		// Check if already enrolled
		const existingEnrollment = await Enrollment.findOne({ userId, courseId });
		if (existingEnrollment) {
			return res.status(400).json({
				success: false,
				message: 'You are already enrolled in this course',
			});
		}

		// Check if user has completed payment (for paid courses)
		if (course.price > 0) {
			const order = await Order.findOne({
				userId,
				courseId,
				paymentStatus: 'completed',
			});

			if (!order) {
				return res.status(400).json({
					success: false,
					message: 'Payment required to enroll in this course',
				});
			}
		}

		// Create enrollment
		const enrollment = await Enrollment.create({ userId, courseId });

		// Update course total students
		await Course.findByIdAndUpdate(courseId, {
			$inc: { totalStudents: 1 },
		});

		// Create notification
		await Notification.create({
			userId,
			type: 'enrollment',
			title: 'Enrollment Successful',
			message: `You have successfully enrolled in ${course.title}`,
			link: `/courses/${courseId}`,
			metadata: { courseId },
		});

		// Notify instructor
		await Notification.create({
			userId: course.instructor,
			type: 'new_student',
			title: 'New Student Enrolled',
			message: `A new student enrolled in your course: ${course.title}`,
			link: `/instructor/courses/${courseId}/students`,
			metadata: { courseId, userId },
		});

		res.status(201).json({
			success: true,
			message: 'Successfully enrolled in the course',
			data: enrollment,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to enroll in course',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/enrollments/my-courses:
 *   get:
 *     summary: Get user's enrolled courses
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 */
export const getMyEnrollments = async (req, res) => {
	try {
		const enrollments = await Enrollment.find({ userId: req.user._id })
			.populate({
				path: 'courseId',
				populate: [
					{ path: 'instructor', select: 'name avatar' },
					{ path: 'categoryId', select: 'name' },
					{ path: 'levelId', select: 'name' },
				],
			})
			.sort({ enrolledAt: -1 });

		res.status(200).json({
			success: true,
			data: enrollments,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch enrollments',
		});
	}
};

/**
 * @swagger
 * /api/enrollments/{courseId}/progress:
 *   get:
 *     summary: Get course progress
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: Course progress details
 */
export const getCourseProgress = async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user._id;

		const enrollment = await Enrollment.findOne({ userId, courseId }).populate('courseId');

		if (!enrollment) {
			return res.status(404).json({
				success: false,
				message: 'Enrollment not found',
			});
		}

		res.status(200).json({
			success: true,
			data: enrollment,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch progress',
		});
	}
};

/**
 * @swagger
 * /api/enrollments/{courseId}/progress:
 *   put:
 *     summary: Update lesson progress
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *             properties:
 *               lessonId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               watchTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated
 */
export const updateProgress = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { lessonId, completed, watchTime } = req.body;
		const userId = req.user._id;

		const enrollment = await Enrollment.findOne({ userId, courseId });

		if (!enrollment) {
			return res.status(404).json({
				success: false,
				message: 'Enrollment not found',
			});
		}

		// Find or create progress entry for this lesson
		let lessonProgress = enrollment.progress.find((p) => p.lessonId.toString() === lessonId);

		if (lessonProgress) {
			if (completed !== undefined) lessonProgress.completed = completed;
			if (watchTime !== undefined) lessonProgress.watchTime = watchTime;
			lessonProgress.lastWatched = new Date();
		} else {
			enrollment.progress.push({
				lessonId,
				completed: completed || false,
				watchTime: watchTime || 0,
			});
		}

		enrollment.lastAccessedAt = new Date();

		// Calculate total lessons in course
		const course = await Course.findById(courseId);
		const totalLessons = course.curriculum.reduce((sum, module) => sum + module.lessons.length, 0);

		// Update completion percentage
		await enrollment.updateProgress(totalLessons);

		res.status(200).json({
			success: true,
			message: 'Progress updated successfully',
			data: enrollment,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update progress',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/enrollments/{courseId}/certificate:
 *   post:
 *     summary: Generate course completion certificate
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: Certificate generated
 */
export const generateCertificate = async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user._id;

		const enrollment = await Enrollment.findOne({ userId, courseId }).populate('courseId userId');

		if (!enrollment) {
			return res.status(404).json({
				success: false,
				message: 'Enrollment not found',
			});
		}

		if (enrollment.completionPercentage < 100) {
			return res.status(400).json({
				success: false,
				message: 'You must complete the course to get a certificate',
			});
		}

		if (enrollment.certificateIssued) {
			return res.status(200).json({
				success: true,
				message: 'Certificate already issued',
				data: { certificateUrl: enrollment.certificateUrl },
			});
		}

		// Generate PDF certificate (simplified example)
		const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
		const certificatesDir = path.join(process.cwd(), 'public', 'certificates');

		if (!fs.existsSync(certificatesDir)) {
			fs.mkdirSync(certificatesDir, { recursive: true });
		}

		const fileName = `certificate_${userId}_${courseId}_${Date.now()}.pdf`;
		const filePath = path.join(certificatesDir, fileName);
		const stream = fs.createWriteStream(filePath);

		doc.pipe(stream);

		// Certificate content
		doc.fontSize(40).text('Certificate of Completion', { align: 'center' });
		doc.moveDown();
		doc.fontSize(20).text(`This certifies that`, { align: 'center' });
		doc.moveDown();
		doc.fontSize(30).text(enrollment.userId.name, { align: 'center', underline: true });
		doc.moveDown();
		doc.fontSize(20).text(`has successfully completed`, { align: 'center' });
		doc.moveDown();
		doc.fontSize(25).text(enrollment.courseId.title, { align: 'center', underline: true });
		doc.moveDown(2);
		doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

		doc.end();

		stream.on('finish', async () => {
			const certificateUrl = `/certificates/${fileName}`;

			enrollment.certificateIssued = true;
			enrollment.certificateUrl = certificateUrl;
			await enrollment.save();

			// Create notification
			await Notification.create({
				userId,
				type: 'certificate_issued',
				title: 'Certificate Issued',
				message: `Your certificate for ${enrollment.courseId.title} is ready`,
				link: certificateUrl,
				metadata: { courseId },
			});

			res.status(200).json({
				success: true,
				message: 'Certificate generated successfully',
				data: { certificateUrl },
			});
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to generate certificate',
			error: error.message,
		});
	}
};

/**
 * @swagger
 * /api/enrollments/{courseId}/notes:
 *   post:
 *     summary: Add a note to a lesson
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *               content:
 *                 type: string
 *               timestamp:
 *                 type: number
 *     responses:
 *       200:
 *         description: Note added
 */
export const addNote = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { lessonId, content, timestamp } = req.body;
		const userId = req.user._id;

		const enrollment = await Enrollment.findOne({ userId, courseId });

		if (!enrollment) {
			return res.status(404).json({
				success: false,
				message: 'Enrollment not found',
			});
		}

		enrollment.notes.push({ lessonId, content, timestamp });
		await enrollment.save();

		res.status(200).json({
			success: true,
			message: 'Note added successfully',
			data: enrollment.notes,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to add note',
		});
	}
};

export default {
	enrollCourse,
	getMyEnrollments,
	getCourseProgress,
	updateProgress,
	generateCertificate,
	addNote,
};
