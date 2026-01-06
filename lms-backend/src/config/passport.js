import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import logger from './logger.js';

console.log('=== PASSPORT CONFIG ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'EXISTS' : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'EXISTS' : 'MISSING');
console.log('=======================');

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	logger.info('Configuring Google OAuth Strategy');
	passport.use(
		'google',
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
				scope: ['profile', 'email'],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					// Check if user exists with this Google ID
					let user = await User.findOne({ oauthProvider: 'google', oauthId: profile.id });

					if (user) {
						// User exists, update info
						user.avatar = profile.photos?.[0]?.value || user.avatar;
						user.isOnline = true;
						await user.save();
						return done(null, user);
					}

					// Check if email already exists
					user = await User.findOne({ email: profile.emails?.[0]?.value });

					if (user) {
						// Link Google account to existing user
						user.oauthProvider = 'google';
						user.oauthId = profile.id;
						user.avatar = profile.photos?.[0]?.value || user.avatar;
						user.isOnline = true;
						await user.save();
						return done(null, user);
					}

					// Create new user
					user = await User.create({
						name: profile.displayName,
						email: profile.emails?.[0]?.value,
						avatar: profile.photos?.[0]?.value,
						oauthProvider: 'google',
						oauthId: profile.id,
						role: 'student',
						isOnline: true,
					});

					logger.info(`New Google user created: ${user.email}`);
					return done(null, user);
				} catch (error) {
					logger.error('Google OAuth error:', error);
					return done(error, null);
				}
			}
		)
	);
} else {
	logger.warn('Google OAuth not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
	logger.info('Configuring Facebook OAuth Strategy');
	passport.use(
		'facebook',
		new FacebookStrategy(
			{
				clientID: process.env.FACEBOOK_APP_ID,
				clientSecret: process.env.FACEBOOK_APP_SECRET,
				callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
				profileFields: ['id', 'displayName', 'photos', 'email'],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					// Check if user exists with this Facebook ID
					let user = await User.findOne({ oauthProvider: 'facebook', oauthId: profile.id });

					if (user) {
						// User exists, update info
						user.avatar = profile.photos?.[0]?.value || user.avatar;
						user.isOnline = true;
						await user.save();
						return done(null, user);
					}

					// Check if email already exists
					user = await User.findOne({ email: profile.emails?.[0]?.value });

					if (user) {
						// Link Facebook account to existing user
						user.oauthProvider = 'facebook';
						user.oauthId = profile.id;
						user.avatar = profile.photos?.[0]?.value || user.avatar;
						user.isOnline = true;
						await user.save();
						return done(null, user);
					}

					// Create new user
					user = await User.create({
						name: profile.displayName,
						email: profile.emails?.[0]?.value,
						avatar: profile.photos?.[0]?.value,
						oauthProvider: 'facebook',
						oauthId: profile.id,
						role: 'student',
						isOnline: true,
					});

					logger.info(`New Facebook user created: ${user.email}`);
					return done(null, user);
				} catch (error) {
					logger.error('Facebook OAuth error:', error);
					return done(error, null);
				}
			}
		)
	);
} else {
	logger.warn('Facebook OAuth not configured. Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
}

// Log registered strategies to aid debugging
logger.info(`Passport strategies loaded: ${Object.keys(passport._strategies).join(', ') || 'none'}`);

// Serialize user
passport.serializeUser((user, done) => {
	done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id).select('-password');
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

export default passport;
