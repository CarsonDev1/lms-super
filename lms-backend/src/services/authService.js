import User from '../models/User.js';
import Session from '../models/Session.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt.js';

const ACCESS_TOKEN_EXPIRATION = '30m';
const REFRESH_TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Register new user
 */
export const register = async ({ email, password, name, phone, bio }) => {
	if (!email || !password || !name) {
		throw new Error('Email, password and name are required');
	}

	// Check if user exists
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error('Email already registered');
	}

	// Hash password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Create user
	const user = await User.create({
		email,
		password: hashedPassword,
		name,
		phone,
		bio,
	});

	return user;
};

/**
 * Login user
 */
export const login = async ({ email, password, userAgent, ipAddress, skipPasswordCheck = false }) => {
	// Find user
	const user = await User.findOne({ email }).select(skipPasswordCheck ? '' : '+password');
	if (!user) {
		throw new Error('Invalid email or password');
	}

	// Check if user is blocked
	if (user.isBlocked) {
		throw new Error(`Account has been blocked. Reason: ${user.blockReason || 'Contact administrator'}`);
	}

	// Verify password when required
	if (!skipPasswordCheck) {
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new Error('Invalid email or password');
		}
	}

	// Generate access token (JWT)
	const accessToken = jwt.sign({ userId: user._id, role: user.role }, jwtConfig.accessTokenSecret, {
		expiresIn: ACCESS_TOKEN_EXPIRATION,
		issuer: jwtConfig.issuer,
		audience: jwtConfig.audience,
	});

	// Generate refresh token (random string)
	const refreshToken = crypto.randomBytes(64).toString('hex');

	// Save session to database
	await Session.create({
		userId: user._id,
		refreshToken,
		expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
		userAgent,
		ipAddress,
	});

	// Update last login
	user.lastLogin = new Date();
	user.isOnline = true;
	await user.save();

	return {
		accessToken,
		refreshToken,
		user: user.getPublicProfile(),
	};
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async ({ refreshToken }) => {
	if (!refreshToken) {
		throw new Error('Refresh token is required');
	}

	// Find session
	const session = await Session.findOne({ refreshToken }).populate('userId');

	if (!session) {
		throw new Error('Invalid refresh token');
	}

	// Check if session expired
	if (session.expiresAt < new Date()) {
		await Session.findByIdAndDelete(session._id);
		throw new Error('Refresh token expired');
	}

	const user = session.userId;

	// Check if user is blocked
	if (user.isBlocked) {
		await Session.findByIdAndDelete(session._id);
		throw new Error('Account has been blocked');
	}

	// Generate new access token
	const accessToken = jwt.sign({ userId: user._id, role: user.role }, jwtConfig.accessTokenSecret, {
		expiresIn: ACCESS_TOKEN_EXPIRATION,
		issuer: jwtConfig.issuer,
		audience: jwtConfig.audience,
	});

	return {
		accessToken,
		user: user.getPublicProfile(),
	};
};

/**
 * Logout user
 */
export const logout = async ({ refreshToken, userId }) => {
	if (refreshToken) {
		await Session.findOneAndDelete({ refreshToken });
	} else if (userId) {
		// Logout from current device only
		await Session.deleteOne({ userId, refreshToken });
	}

	// Update user online status
	if (userId) {
		await User.findByIdAndUpdate(userId, {
			isOnline: false,
			lastSeen: new Date(),
		});
	}
};

/**
 * Logout from all devices
 */
export const logoutAll = async ({ userId }) => {
	// Delete all sessions
	await Session.deleteMany({ userId });

	// Update user online status
	await User.findByIdAndUpdate(userId, {
		isOnline: false,
		lastSeen: new Date(),
	});
};

/**
 * Get user sessions
 */
export const getUserSessions = async ({ userId }) => {
	const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

	return sessions.map((session) => ({
		id: session._id,
		userAgent: session.userAgent,
		ipAddress: session.ipAddress,
		createdAt: session.createdAt,
		expiresAt: session.expiresAt,
		isExpired: session.expiresAt < new Date(),
	}));
};

/**
 * Delete specific session
 */
export const deleteSession = async ({ userId, sessionId }) => {
	const session = await Session.findOne({ _id: sessionId, userId });

	if (!session) {
		throw new Error('Session not found');
	}

	await Session.findByIdAndDelete(sessionId);
};

export default {
	register,
	login,
	refreshAccessToken,
	logout,
	logoutAll,
	getUserSessions,
	deleteSession,
};
