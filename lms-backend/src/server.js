import 'dotenv/config';
import http from 'http';
import app from './app.js';
import logger from './config/logger.js';
import { initializeSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);
logger.info('✅ Socket.io initialized');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
	server.close(() => {
		process.exit(1);
	});
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
	logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
	process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
	server.close(() => {
		logger.info('💥 Process terminated!');
	});
});

server.listen(PORT, () => {
	logger.info(`🚀 Server is running on port ${PORT}`);
	logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
	logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
	logger.info(`🔌 Socket.io ready for real-time connections`);
	logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
