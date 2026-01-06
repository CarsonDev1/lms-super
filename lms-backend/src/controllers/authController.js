import * as authService from '../services/authService.js';
import logger from '../config/logger.js';

const REFRESH_TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
export const register = async (req, res) => {
	try {
		const { email, password, name, phone, bio } = req.body;

		const user = await authService.register({ email, password, name, phone, bio });

		logger.info(`New user registered: ${email}`);

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			data: {
				user: user.getPublicProfile(),
			},
		});
	} catch (error) {
		logger.error('Register error:', error);
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const userAgent = req.headers['user-agent'];
		const ipAddress = req.ip || req.connection.remoteAddress;

		const { accessToken, refreshToken, user } = await authService.login({
			email,
			password,
			userAgent,
			ipAddress,
		});

		// Set refresh token in httpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: REFRESH_TOKEN_EXPIRATION,
		});

		logger.info(`User logged in: ${email}`);

		res.status(200).json({
			success: true,
			message: 'Login successful',
			data: {
				accessToken,
				user,
			},
		});
	} catch (error) {
		logger.error('Login error:', error);
		res.status(401).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: 'Refresh token not found',
			});
		}

		const { accessToken, user } = await authService.refreshAccessToken({ refreshToken });

		res.status(200).json({
			success: true,
			message: 'Token refreshed successfully',
			data: {
				accessToken,
				user,
			},
		});
	} catch (error) {
		logger.error('Token refresh error:', error);
		res.clearCookie('refreshToken');
		res.status(401).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		const userId = req.user?._id;

		await authService.logout({ refreshToken, userId });

		res.clearCookie('refreshToken');

		logger.info(`User logged out: ${req.user?.email}`);

		res.status(200).json({
			success: true,
			message: 'Logout successful',
		});
	} catch (error) {
		logger.error('Logout error:', error);
		res.clearCookie('refreshToken');
		res.status(200).json({
			success: true,
			message: 'Logout successful',
		});
	}
};

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 */
export const logoutAll = async (req, res) => {
	try {
		const userId = req.user._id;

		await authService.logoutAll({ userId });

		res.clearCookie('refreshToken');

		logger.info(`User logged out from all devices: ${req.user.email}`);

		res.status(200).json({
			success: true,
			message: 'Logged out from all devices successfully',
		});
	} catch (error) {
		logger.error('Logout all error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to logout from all devices',
		});
	}
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getMe = async (req, res) => {
	try {
		res.status(200).json({
			success: true,
			data: {
				user: req.user,
			},
		});
	} catch (error) {
		logger.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get profile',
		});
	}
};

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get all user sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 */
export const getSessions = async (req, res) => {
	try {
		const userId = req.user._id;

		const sessions = await authService.getUserSessions({ userId });

		res.status(200).json({
			success: true,
			data: {
				sessions,
				total: sessions.length,
			},
		});
	} catch (error) {
		logger.error('Get sessions error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get sessions',
		});
	}
};

/**
 * @swagger
 * /api/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Delete specific session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *     responses:
 *       200:
 *         description: Session deleted successfully
 */
export const deleteSession = async (req, res) => {
	try {
		const userId = req.user._id;
		const { sessionId } = req.params;

		await authService.deleteSession({ userId, sessionId });

		res.status(200).json({
			success: true,
			message: 'Session deleted successfully',
		});
	} catch (error) {
		logger.error('Delete session error:', error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
// Handled by passport middleware

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authentication successful
 */
export const googleCallback = async (req, res) => {
	try {
		const userAgent = req.headers['user-agent'];
		const ipAddress = req.ip || req.connection.remoteAddress;

		const { accessToken, refreshToken } = await authService.login({
			email: req.user.email,
			password: null,
			userAgent,
			ipAddress,
			skipPasswordCheck: true,
		});

		// Set refresh token in httpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: REFRESH_TOKEN_EXPIRATION,
		});

		// Redirect to frontend with access token
		const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
		const redirectUrl = `${frontend}/auth/callback?accessToken=${accessToken}`;
		res.redirect(redirectUrl);
	} catch (error) {
		logger.error('Google callback error:', error);
		const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
		res.redirect(`${frontend}/login?error=oauth_failed`);
	}
};

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Facebook OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Facebook OAuth
 */
// Handled by passport middleware

/**
 * @swagger
 * /api/auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authentication successful
 */
export const facebookCallback = async (req, res) => {
	try {
		const userAgent = req.headers['user-agent'];
		const ipAddress = req.ip || req.connection.remoteAddress;

		const { accessToken, refreshToken } = await authService.login({
			email: req.user.email,
			password: null,
			userAgent,
			ipAddress,
			skipPasswordCheck: true,
		});

		// Set refresh token in httpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: REFRESH_TOKEN_EXPIRATION,
		});

		// Redirect to frontend with access token
		const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
		const redirectUrl = `${frontend}/auth/callback?accessToken=${accessToken}`;
		res.redirect(redirectUrl);
	} catch (error) {
		logger.error('Facebook callback error:', error);
		const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
		res.redirect(`${frontend}/login?error=oauth_failed`);
	}
};

export default {
	register,
	login,
	refreshToken,
	logout,
	logoutAll,
	getMe,
	getSessions,
	deleteSession,
	googleCallback,
	facebookCallback,
};
