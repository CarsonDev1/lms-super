import logger from '../config/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
	logger.error('Error:', {
		message: err.message,
		stack: err.stack,
		url: req.originalUrl,
		method: req.method,
	});

	// Mongoose duplicate key error
	if (err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0];
		return res.status(400).json({
			success: false,
			message: `${field} already exists`,
		});
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const errors = Object.values(err.errors).map((e) => ({
			field: e.path,
			message: e.message,
		}));
		return res.status(400).json({
			success: false,
			message: 'Validation error',
			errors,
		});
	}

	// Mongoose cast error (invalid ID)
	if (err.name === 'CastError') {
		return res.status(400).json({
			success: false,
			message: 'Invalid ID format',
		});
	}

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({
			success: false,
			message: 'Invalid token',
		});
	}

	if (err.name === 'TokenExpiredError') {
		return res.status(401).json({
			success: false,
			message: 'Token expired',
		});
	}

	// Default error
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		success: false,
		message: err.message || 'Internal server error',
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	});
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res) => {
	res.status(404).json({
		success: false,
		message: `Route ${req.originalUrl} not found`,
	});
};

export default { errorHandler, notFound };
