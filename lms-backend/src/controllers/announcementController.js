import Announcement from '../models/Announcement.js';

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Public
 */
export const getAnnouncements = async (req, res) => {
	const { type, priority, status } = req.query;

	const filter = {};
	if (type) filter.type = type;
	if (priority) filter.priority = priority;
	if (status) filter.status = status;

	const announcements = await Announcement.find(filter)
		.populate('createdBy', 'name avatar')
		.sort('-scheduling.publishAt');

	res.json({
		success: true,
		count: announcements.length,
		data: announcements,
	});
};

/**
 * @desc    Get active announcements for user
 * @route   GET /api/announcements/active
 * @access  Private
 */
export const getActiveAnnouncements = async (req, res) => {
	const now = new Date();

	const announcements = await Announcement.find({
		status: 'active',
		'scheduling.publishAt': { $lte: now },
		$or: [{ 'scheduling.expiresAt': { $exists: false } }, { 'scheduling.expiresAt': { $gt: now } }],
	})
		.populate('createdBy', 'name avatar')
		.sort('-priority -scheduling.publishAt');

	// Filter by target audience
	const filteredAnnouncements = announcements.filter((announcement) => {
		const { scope, roles, userIds } = announcement.targetAudience;

		if (scope === 'all') return true;

		if (scope === 'role' && roles.includes(req.user.role)) return true;

		if (scope === 'user' && userIds.some((id) => id.toString() === req.user._id.toString())) {
			return true;
		}

		return false;
	});

	res.json({
		success: true,
		count: filteredAnnouncements.length,
		data: filteredAnnouncements,
	});
};

/**
 * @desc    Get announcement by ID
 * @route   GET /api/announcements/:id
 * @access  Public
 */
export const getAnnouncementById = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name avatar');

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	res.json({
		success: true,
		data: announcement,
	});
};

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 * @access  Private/Admin
 */
export const createAnnouncement = async (req, res) => {
	const announcement = await Announcement.create({
		...req.body,
		createdBy: req.user._id,
	});

	// Auto-activate if publish date is now or past
	if (new Date(announcement.scheduling.publishAt) <= new Date()) {
		announcement.status = 'active';
		await announcement.save();
	} else {
		announcement.status = 'scheduled';
		await announcement.save();
	}

	res.status(201).json({
		success: true,
		data: announcement,
	});
};

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Private/Admin
 */
export const updateAnnouncement = async (req, res) => {
	let announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.json({
		success: true,
		data: announcement,
	});
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private/Admin
 */
export const deleteAnnouncement = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	await announcement.deleteOne();

	res.json({
		success: true,
		message: 'Announcement deleted successfully',
	});
};

/**
 * @desc    Activate announcement
 * @route   PUT /api/announcements/:id/activate
 * @access  Private/Admin
 */
export const activateAnnouncement = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	announcement.status = 'active';
	await announcement.save();

	res.json({
		success: true,
		data: announcement,
		message: 'Announcement activated',
	});
};

/**
 * @desc    Deactivate announcement
 * @route   PUT /api/announcements/:id/deactivate
 * @access  Private/Admin
 */
export const deactivateAnnouncement = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	announcement.status = 'expired';
	await announcement.save();

	res.json({
		success: true,
		data: announcement,
		message: 'Announcement deactivated',
	});
};

/**
 * @desc    Mark announcement as viewed
 * @route   POST /api/announcements/:id/view
 * @access  Private
 */
export const markAsViewed = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	announcement.stats.totalViews += 1;
	await announcement.save();

	res.json({
		success: true,
		message: 'Marked as viewed',
	});
};

/**
 * @desc    Dismiss announcement
 * @route   POST /api/announcements/:id/dismiss
 * @access  Private
 */
export const dismissAnnouncement = async (req, res) => {
	const announcement = await Announcement.findById(req.params.id);

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' });
	}

	announcement.stats.totalDismissals += 1;
	await announcement.save();

	res.json({
		success: true,
		message: 'Announcement dismissed',
	});
};

export default {
	getAnnouncements,
	getActiveAnnouncements,
	getAnnouncementById,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement,
	activateAnnouncement,
	deactivateAnnouncement,
	markAsViewed,
	dismissAnnouncement,
};
