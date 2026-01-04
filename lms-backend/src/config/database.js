import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
	try {
		const options = {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		};

		const conn = await mongoose.connect(process.env.MONGODB_URI, options);

		logger.info(`MongoDB Connected: ${conn.connection.host}`);

		// Handle connection events
		mongoose.connection.on('disconnected', () => {
			logger.warn('MongoDB disconnected');
		});

		mongoose.connection.on('error', (err) => {
			logger.error('MongoDB connection error:', err);
		});
	} catch (error) {
		logger.error('Error connecting to MongoDB:', error.message);
		process.exit(1);
	}
};

export default connectDB;
