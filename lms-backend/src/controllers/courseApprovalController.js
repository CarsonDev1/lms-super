import CourseApproval from '../models/CourseApproval.js';
import Course from '../models/Course.js';
import CourseVersion from '../models/CourseVersion.js';

/**
 * @desc    Submit course for approval
 * @route   POST /api/course-approvals/submit
 * @access  Private/Instructor
 */
export const submitForApproval = async (req, res) => {
	const { courseId, versionId, submissionType, submissionNotes } = req.body;

	const course = await Course.findById(courseId);
	if (!course) {
		return res.status(404).json({ message: 'Course not found' });
	}

	// Check if user is course instructor
	if (course.instructor.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: 'Not authorized' });
	}

	const approval = await CourseApproval.create({
		courseId,
		versionId,
		submittedBy: req.user._id,
		submissionType,
		submissionNotes,
		status: 'pending',
		history: [
			{
				action: 'submitted',
				by: req.user._id,
				at: new Date(),
				notes: submissionNotes,
			},
		],
	});

	res.status(201).json({
		success: true,
		data: approval,
		message: 'Course submitted for approval',
	});
};

/**
 * @desc    Get all course approvals
 * @route   GET /api/course-approvals
 * @access  Private/Admin/Reviewer
 */
export const getCourseApprovals = async (req, res) => {
	const { status, priority } = req.query;

	const filter = {};
	if (status) filter.status = status;
	if (priority) filter.priority = priority;

	const approvals = await CourseApproval.find(filter)
		.populate('courseId', 'title thumbnail')
		.populate('submittedBy', 'name email')
		.populate('reviewedBy', 'name')
		.sort('-submittedAt');

	res.json({
		success: true,
		count: approvals.length,
		data: approvals,
	});
};

/**
 * @desc    Get my course approvals (instructor)
 * @route   GET /api/course-approvals/my-submissions
 * @access  Private/Instructor
 */
export const getMySubmissions = async (req, res) => {
	const approvals = await CourseApproval.find({ submittedBy: req.user._id })
		.populate('courseId', 'title thumbnail')
		.populate('reviewedBy', 'name')
		.sort('-submittedAt');

	res.json({
		success: true,
		count: approvals.length,
		data: approvals,
	});
};

/**
 * @desc    Get course approval by ID
 * @route   GET /api/course-approvals/:id
 * @access  Private
 */
export const getCourseApprovalById = async (req, res) => {
	const approval = await CourseApproval.findById(req.params.id)
		.populate('courseId')
		.populate('versionId')
		.populate('submittedBy', 'name email avatar')
		.populate('reviewedBy', 'name email')
		.populate('feedback.reviewerId', 'name');

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	res.json({
		success: true,
		data: approval,
	});
};

/**
 * @desc    Add feedback to approval
 * @route   POST /api/course-approvals/:id/feedback
 * @access  Private/Admin/Reviewer
 */
export const addFeedback = async (req, res) => {
	const { comment, type, section } = req.body;

	const approval = await CourseApproval.findById(req.params.id);

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	await approval.addFeedback(req.user._id, comment, type, section);

	res.json({
		success: true,
		data: approval,
		message: 'Feedback added',
	});
};

/**
 * @desc    Approve course
 * @route   POST /api/course-approvals/:id/approve
 * @access  Private/Admin/Reviewer
 */
export const approveCourse = async (req, res) => {
	const { notes } = req.body;

	const approval = await CourseApproval.findById(req.params.id).populate('courseId');

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	await approval.approve(req.user._id, notes);

	// Update course status
	const course = await Course.findById(approval.courseId);
	if (course) {
		course.status = 'published';
		course.publishedAt = new Date();
		await course.save();
	}

	res.json({
		success: true,
		data: approval,
		message: 'Course approved successfully',
	});
};

/**
 * @desc    Reject course
 * @route   POST /api/course-approvals/:id/reject
 * @access  Private/Admin/Reviewer
 */
export const rejectCourse = async (req, res) => {
	const { reason, notes } = req.body;

	const approval = await CourseApproval.findById(req.params.id);

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	await approval.reject(req.user._id, reason, notes);

	res.json({
		success: true,
		data: approval,
		message: 'Course rejected',
	});
};

/**
 * @desc    Request revision
 * @route   POST /api/course-approvals/:id/request-revision
 * @access  Private/Admin/Reviewer
 */
export const requestRevision = async (req, res) => {
	const { feedback, deadline } = req.body;

	const approval = await CourseApproval.findById(req.params.id);

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	await approval.requestRevision(req.user._id, feedback, deadline);

	res.json({
		success: true,
		data: approval,
		message: 'Revision requested',
	});
};

/**
 * @desc    Update checklist
 * @route   PUT /api/course-approvals/:id/checklist
 * @access  Private/Admin/Reviewer
 */
export const updateChecklist = async (req, res) => {
	const approval = await CourseApproval.findById(req.params.id);

	if (!approval) {
		return res.status(404).json({ message: 'Course approval not found' });
	}

	approval.checklist = {
		...approval.checklist,
		...req.body,
	};

	await approval.save();

	res.json({
		success: true,
		data: approval,
	});
};

export default {
	submitForApproval,
	getCourseApprovals,
	getMySubmissions,
	getCourseApprovalById,
	addFeedback,
	approveCourse,
	rejectCourse,
	requestRevision,
	updateChecklist,
};
