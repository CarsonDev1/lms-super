import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import swaggerSpec from './config/swagger.js';
import connectDB from './config/database.js';
import logger from './config/logger.js';
import passport from './config/passport.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistCartRoutes from './routes/wishlistCartRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import studyPlanRoutes from './routes/studyPlanRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import courseApprovalRoutes from './routes/courseApprovalRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet());

// CORS allow all origins (reflects request origin, supports credentials)
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1200, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(
		morgan('combined', {
			stream: {
				write: (message) => logger.info(message.trim()),
			},
		})
	);
}

// API Documentation
app.use(
	'/api-docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		explorer: true,
		customCss: '.swagger-ui .topbar { display: none }',
		customSiteTitle: 'LMS API Documentation',
	})
);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Server is healthy',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
	});
});

// API routes
app.get('/', (req, res) => {
	res.json({
		success: true,
		message: 'Welcome to LMS Backend API',
		version: '1.0.0',
		documentation: '/api-docs',
	});
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', wishlistCartRoutes); // Includes /wishlist and /cart
app.use('/api/coupons', couponRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/course-approvals', courseApprovalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
