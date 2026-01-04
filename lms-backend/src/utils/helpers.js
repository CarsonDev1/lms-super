/**
 * Success response helper
 */
export const successResponse = (res, statusCode = 200, message, data = null) => {
	const response = {
		success: true,
		message,
	};

	if (data) {
		response.data = data;
	}

	return res.status(statusCode).json(response);
};

/**
 * Error response helper
 */
export const errorResponse = (res, statusCode = 500, message, errors = null) => {
	const response = {
		success: false,
		message,
	};

	if (errors) {
		response.errors = errors;
	}

	return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 */
export const getPagination = (page = 1, limit = 10, total) => {
	const currentPage = parseInt(page);
	const itemsPerPage = parseInt(limit);
	const totalPages = Math.ceil(total / itemsPerPage);
	const skip = (currentPage - 1) * itemsPerPage;

	return {
		page: currentPage,
		limit: itemsPerPage,
		total,
		pages: totalPages,
		skip,
		hasNext: currentPage < totalPages,
		hasPrev: currentPage > 1,
	};
};

/**
 * Generate random string
 */
export const generateRandomString = (length = 32) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

/**
 * Sleep/delay helper
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
	return (
		value === undefined ||
		value === null ||
		(typeof value === 'object' && Object.keys(value).length === 0) ||
		(typeof value === 'string' && value.trim().length === 0)
	);
};

export default {
	successResponse,
	errorResponse,
	getPagination,
	generateRandomString,
	sleep,
	formatDate,
	isEmpty,
};
