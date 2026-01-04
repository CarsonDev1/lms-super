import { uploadToCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary } from '../config/cloudinary.js';

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
export const uploadImage = async (req, res) => {
	try {
		if (!req.cloudinaryResult) {
			return res.status(400).json({
				success: false,
				message: 'No image uploaded',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Image uploaded successfully',
			data: {
				url: req.cloudinaryResult.url,
				publicId: req.cloudinaryResult.publicId,
				thumbnails: req.thumbnails || null,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to upload image',
		});
	}
};

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload single video
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
export const uploadVideo = async (req, res) => {
	try {
		if (!req.cloudinaryResult) {
			return res.status(400).json({
				success: false,
				message: 'No video uploaded',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Video uploaded successfully',
			data: {
				url: req.cloudinaryResult.url,
				publicId: req.cloudinaryResult.publicId,
				duration: req.cloudinaryResult.duration || null,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to upload video',
		});
	}
};

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
export const uploadMultipleFiles = async (req, res) => {
	try {
		if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'No files uploaded',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Files uploaded successfully',
			data: {
				files: req.cloudinaryResults.map((result) => ({
					url: result.url,
					publicId: result.publicId,
					resourceType: result.resourceType,
				})),
				count: req.cloudinaryResults.length,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to upload files',
		});
	}
};

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
export const deleteFile = async (req, res) => {
	try {
		const { publicId, resourceType = 'image' } = req.body;

		if (!publicId) {
			return res.status(400).json({
				success: false,
				message: 'Public ID is required',
			});
		}

		const result = await deleteFromCloudinary(publicId, resourceType);

		if (!result.success) {
			return res.status(400).json({
				success: false,
				message: 'Failed to delete file',
			});
		}

		res.status(200).json({
			success: true,
			message: 'File deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete file',
		});
	}
};

/**
 * @swagger
 * /api/upload/delete-multiple:
 *   delete:
 *     summary: Delete multiple files from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *     responses:
 *       200:
 *         description: Files deleted successfully
 */
export const deleteMultipleFiles = async (req, res) => {
	try {
		const { publicIds, resourceType = 'image' } = req.body;

		if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Public IDs array is required',
			});
		}

		const result = await deleteMultipleFromCloudinary(publicIds, resourceType);

		res.status(200).json({
			success: true,
			message: 'Files deleted successfully',
			data: {
				deleted: result.deleted,
				deletedCounts: result.deletedCounts,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete files',
		});
	}
};

export default {
	uploadImage,
	uploadVideo,
	uploadMultipleFiles,
	deleteFile,
	deleteMultipleFiles,
};
