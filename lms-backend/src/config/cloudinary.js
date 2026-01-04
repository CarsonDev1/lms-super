import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path or base64 string
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
	try {
		const defaultOptions = {
			folder: 'lms',
			resource_type: 'auto',
			...options,
		};

		const result = await cloudinary.uploader.upload(filePath, defaultOptions);

		return {
			success: true,
			url: result.secure_url,
			publicId: result.public_id,
			format: result.format,
			width: result.width,
			height: result.height,
			bytes: result.bytes,
			resourceType: result.resource_type,
		};
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
	}
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths
 * @param {object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, options = {}) => {
	try {
		const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
		return await Promise.all(uploadPromises);
	} catch (error) {
		console.error('Cloudinary multiple upload error:', error);
		throw new Error(`Failed to upload multiple files: ${error.message}`);
	}
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<object>} Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
	try {
		const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

		return {
			success: result.result === 'ok',
			result: result.result,
		};
	} catch (error) {
		console.error('Cloudinary delete error:', error);
		throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
	}
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @param {string} resourceType - Resource type
 * @returns {Promise<object>} Delete result
 */
export const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
	try {
		const result = await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });

		return {
			success: true,
			deleted: result.deleted,
			deletedCounts: result.deleted_counts,
		};
	} catch (error) {
		console.error('Cloudinary multiple delete error:', error);
		throw new Error(`Failed to delete multiple files: ${error.message}`);
	}
};

/**
 * Generate transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} Transformed URL
 */
export const getTransformedUrl = (publicId, transformations = {}) => {
	return cloudinary.url(publicId, transformations);
};

/**
 * Upload image with transformations
 * @param {string} filePath - File path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result with transformed URLs
 */
export const uploadImageWithThumbnails = async (filePath, options = {}) => {
	try {
		const uploadResult = await uploadToCloudinary(filePath, {
			...options,
			eager: [
				{ width: 400, height: 300, crop: 'fill' }, // Thumbnail
				{ width: 800, height: 600, crop: 'fill' }, // Medium
				{ width: 1200, height: 900, crop: 'fill' }, // Large
			],
			eager_async: false,
		});

		return {
			...uploadResult,
			thumbnails: {
				small: cloudinary.url(uploadResult.publicId, { width: 400, height: 300, crop: 'fill' }),
				medium: cloudinary.url(uploadResult.publicId, { width: 800, height: 600, crop: 'fill' }),
				large: cloudinary.url(uploadResult.publicId, { width: 1200, height: 900, crop: 'fill' }),
			},
		};
	} catch (error) {
		console.error('Cloudinary thumbnail upload error:', error);
		throw new Error(`Failed to upload image with thumbnails: ${error.message}`);
	}
};

/**
 * Upload video with optimization
 * @param {string} filePath - Video file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadVideoOptimized = async (filePath, options = {}) => {
	try {
		const uploadResult = await uploadToCloudinary(filePath, {
			...options,
			resource_type: 'video',
			eager: [
				{
					format: 'mp4',
					video_codec: 'h264',
					audio_codec: 'aac',
					quality: 'auto',
				},
			],
			eager_async: true,
		});

		return uploadResult;
	} catch (error) {
		console.error('Cloudinary video upload error:', error);
		throw new Error(`Failed to upload video: ${error.message}`);
	}
};

/**
 * Get folder files
 * @param {string} folder - Folder name
 * @param {object} options - List options
 * @returns {Promise<object>} List result
 */
export const listFolderFiles = async (folder, options = {}) => {
	try {
		const result = await cloudinary.api.resources({
			type: 'upload',
			prefix: folder,
			max_results: 500,
			...options,
		});

		return {
			success: true,
			resources: result.resources,
			total: result.resources.length,
		};
	} catch (error) {
		console.error('Cloudinary list error:', error);
		throw new Error(`Failed to list folder files: ${error.message}`);
	}
};

export default cloudinary;
