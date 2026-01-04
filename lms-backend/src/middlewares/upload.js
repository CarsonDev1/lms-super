import multer from 'multer';
import path from 'path';
import { uploadToCloudinary, uploadImageWithThumbnails, uploadVideoOptimized } from '../config/cloudinary.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
	// Allowed file types
	const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
	const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
	const allowedDocTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx/;

	const extname = path.extname(file.originalname).toLowerCase();
	const mimetype = file.mimetype;

	// Check if file type is allowed
	if (
		allowedImageTypes.test(extname) ||
		allowedVideoTypes.test(extname) ||
		allowedDocTypes.test(extname) ||
		mimetype.startsWith('image/') ||
		mimetype.startsWith('video/') ||
		mimetype.startsWith('application/')
	) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
	}
};

// Multer configuration
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 100 * 1024 * 1024, // 100MB max file size
	},
});

/**
 * Middleware to upload single file to Cloudinary
 */
export const uploadSingle = (fieldName, folder = 'lms') => {
	return async (req, res, next) => {
		const uploadMiddleware = upload.single(fieldName);

		uploadMiddleware(req, res, async (err) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
				});
			}

			if (!req.file) {
				return next();
			}

			try {
				// Convert buffer to base64
				const b64 = Buffer.from(req.file.buffer).toString('base64');
				const dataURI = `data:${req.file.mimetype};base64,${b64}`;

				// Upload to Cloudinary
				const result = await uploadToCloudinary(dataURI, {
					folder: `lms/${folder}`,
					resource_type: 'auto',
				});

				// Attach result to request
				req.cloudinaryResult = result;
				req.uploadedFileUrl = result.url;

				next();
			} catch (error) {
				return res.status(500).json({
					success: false,
					message: 'Failed to upload file to Cloudinary',
					error: error.message,
				});
			}
		});
	};
};

/**
 * Middleware to upload multiple files to Cloudinary
 */
export const uploadMultiple = (fieldName, maxCount = 10, folder = 'lms') => {
	return async (req, res, next) => {
		const uploadMiddleware = upload.array(fieldName, maxCount);

		uploadMiddleware(req, res, async (err) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
				});
			}

			if (!req.files || req.files.length === 0) {
				return next();
			}

			try {
				const uploadPromises = req.files.map(async (file) => {
					const b64 = Buffer.from(file.buffer).toString('base64');
					const dataURI = `data:${file.mimetype};base64,${b64}`;

					return await uploadToCloudinary(dataURI, {
						folder: `lms/${folder}`,
						resource_type: 'auto',
					});
				});

				const results = await Promise.all(uploadPromises);

				// Attach results to request
				req.cloudinaryResults = results;
				req.uploadedFileUrls = results.map((r) => r.url);

				next();
			} catch (error) {
				return res.status(500).json({
					success: false,
					message: 'Failed to upload files to Cloudinary',
					error: error.message,
				});
			}
		});
	};
};

/**
 * Middleware to upload image with thumbnails
 */
export const uploadImage = (fieldName, folder = 'images') => {
	return async (req, res, next) => {
		const uploadMiddleware = upload.single(fieldName);

		uploadMiddleware(req, res, async (err) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
				});
			}

			if (!req.file) {
				return next();
			}

			try {
				// Check if it's an image
				if (!req.file.mimetype.startsWith('image/')) {
					return res.status(400).json({
						success: false,
						message: 'Only image files are allowed',
					});
				}

				const b64 = Buffer.from(req.file.buffer).toString('base64');
				const dataURI = `data:${req.file.mimetype};base64,${b64}`;

				// Upload image with thumbnails
				const result = await uploadImageWithThumbnails(dataURI, {
					folder: `lms/${folder}`,
				});

				req.cloudinaryResult = result;
				req.uploadedFileUrl = result.url;
				req.thumbnails = result.thumbnails;

				next();
			} catch (error) {
				return res.status(500).json({
					success: false,
					message: 'Failed to upload image to Cloudinary',
					error: error.message,
				});
			}
		});
	};
};

/**
 * Middleware to upload video
 */
export const uploadVideo = (fieldName, folder = 'videos') => {
	return async (req, res, next) => {
		const uploadMiddleware = upload.single(fieldName);

		uploadMiddleware(req, res, async (err) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
				});
			}

			if (!req.file) {
				return next();
			}

			try {
				// Check if it's a video
				if (!req.file.mimetype.startsWith('video/')) {
					return res.status(400).json({
						success: false,
						message: 'Only video files are allowed',
					});
				}

				const b64 = Buffer.from(req.file.buffer).toString('base64');
				const dataURI = `data:${req.file.mimetype};base64,${b64}`;

				// Upload video with optimization
				const result = await uploadVideoOptimized(dataURI, {
					folder: `lms/${folder}`,
				});

				req.cloudinaryResult = result;
				req.uploadedFileUrl = result.url;

				next();
			} catch (error) {
				return res.status(500).json({
					success: false,
					message: 'Failed to upload video to Cloudinary',
					error: error.message,
				});
			}
		});
	};
};

/**
 * Middleware to handle multiple file types
 */
export const uploadFields = (fields, folder = 'lms') => {
	return async (req, res, next) => {
		const uploadMiddleware = upload.fields(fields);

		uploadMiddleware(req, res, async (err) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
				});
			}

			if (!req.files) {
				return next();
			}

			try {
				const results = {};

				for (const [fieldName, files] of Object.entries(req.files)) {
					const uploadPromises = files.map(async (file) => {
						const b64 = Buffer.from(file.buffer).toString('base64');
						const dataURI = `data:${file.mimetype};base64,${b64}`;

						return await uploadToCloudinary(dataURI, {
							folder: `lms/${folder}/${fieldName}`,
							resource_type: 'auto',
						});
					});

					results[fieldName] = await Promise.all(uploadPromises);
				}

				req.cloudinaryResults = results;
				next();
			} catch (error) {
				return res.status(500).json({
					success: false,
					message: 'Failed to upload files to Cloudinary',
					error: error.message,
				});
			}
		});
	};
};

export default {
	uploadSingle,
	uploadMultiple,
	uploadImage,
	uploadVideo,
	uploadFields,
};
