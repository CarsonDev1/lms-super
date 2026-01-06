import CMSPage from '../models/CMSPage.js';

/**
 * @desc    Get all CMS pages
 * @route   GET /api/cms/pages
 * @access  Public
 */
export const getPages = async (req, res) => {
	const { type, status } = req.query;

	const filter = {};
	if (type) filter.type = type;
	if (status) filter.status = status;
	else filter.status = 'published'; // Default to published only

	const pages = await CMSPage.find(filter).populate('author', 'name avatar').sort('-createdAt');

	res.json({
		success: true,
		count: pages.length,
		data: pages,
	});
};

/**
 * @desc    Get CMS page by slug
 * @route   GET /api/cms/pages/:slug
 * @access  Public
 */
export const getPageBySlug = async (req, res) => {
	const page = await CMSPage.findOne({ slug: req.params.slug })
		.populate('author', 'name avatar')
		.populate('lastEditedBy', 'name');

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	// Increment view count
	page.viewCount += 1;
	await page.save();

	res.json({
		success: true,
		data: page,
	});
};

/**
 * @desc    Get CMS page by ID
 * @route   GET /api/cms/pages/id/:id
 * @access  Private/Admin
 */
export const getPageById = async (req, res) => {
	const page = await CMSPage.findById(req.params.id)
		.populate('author', 'name avatar')
		.populate('lastEditedBy', 'name');

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	res.json({
		success: true,
		data: page,
	});
};

/**
 * @desc    Create CMS page
 * @route   POST /api/cms/pages
 * @access  Private/Admin
 */
export const createPage = async (req, res) => {
	const page = await CMSPage.create({
		...req.body,
		author: req.user._id,
	});

	res.status(201).json({
		success: true,
		data: page,
	});
};

/**
 * @desc    Update CMS page
 * @route   PUT /api/cms/pages/:id
 * @access  Private/Admin
 */
export const updatePage = async (req, res) => {
	let page = await CMSPage.findById(req.params.id);

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	page = await CMSPage.findByIdAndUpdate(
		req.params.id,
		{
			...req.body,
			lastEditedBy: req.user._id,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.json({
		success: true,
		data: page,
	});
};

/**
 * @desc    Publish page
 * @route   PUT /api/cms/pages/:id/publish
 * @access  Private/Admin
 */
export const publishPage = async (req, res) => {
	const page = await CMSPage.findById(req.params.id);

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	page.status = 'published';
	page.publishedAt = new Date();
	await page.save();

	res.json({
		success: true,
		data: page,
		message: 'Page published successfully',
	});
};

/**
 * @desc    Unpublish page
 * @route   PUT /api/cms/pages/:id/unpublish
 * @access  Private/Admin
 */
export const unpublishPage = async (req, res) => {
	const page = await CMSPage.findById(req.params.id);

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	page.status = 'draft';
	await page.save();

	res.json({
		success: true,
		data: page,
		message: 'Page unpublished successfully',
	});
};

/**
 * @desc    Delete page
 * @route   DELETE /api/cms/pages/:id
 * @access  Private/Admin
 */
export const deletePage = async (req, res) => {
	const page = await CMSPage.findById(req.params.id);

	if (!page) {
		return res.status(404).json({ message: 'Page not found' });
	}

	await page.deleteOne();

	res.json({
		success: true,
		message: 'Page deleted successfully',
	});
};

/**
 * @desc    Get menu pages
 * @route   GET /api/cms/menu
 * @access  Public
 */
export const getMenuPages = async (req, res) => {
	const pages = await CMSPage.find({
		showInMenu: true,
		status: 'published',
	})
		.select('slug menuTitle title')
		.sort('order');

	res.json({
		success: true,
		count: pages.length,
		data: pages,
	});
};

export default {
	getPages,
	getPageBySlug,
	getPageById,
	createPage,
	updatePage,
	publishPage,
	unpublishPage,
	deletePage,
	getMenuPages,
};
