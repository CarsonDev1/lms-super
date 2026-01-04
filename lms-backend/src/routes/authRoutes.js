import express from 'express';
import passport from 'passport';
import {
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
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { registerValidation, loginValidation, refreshTokenValidation } from '../validators/authValidator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshTokenValidation, validate, refreshToken);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
	'/google/callback',
	passport.authenticate('google', { session: false, failureRedirect: '/login' }),
	googleCallback
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
	'/facebook/callback',
	passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
	facebookCallback
);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:sessionId', authenticate, deleteSession);

export default router;
