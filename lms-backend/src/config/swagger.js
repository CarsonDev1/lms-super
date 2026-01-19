import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'LMS Backend API - Complete',
			version: '2.0.0',
			description: `
# Professional Learning Management System API

Complete LMS platform with:
- 🎓 Course Management & Approval Workflow
- 📚 Study Plans & Adaptive Learning  
- 🎮 Gamification (XP, Achievements, Streaks)
- 🗺️ Learning Roadmap & Levels
- 📊 Analytics & Dashboards
- 🤖 AI Chatbot
- 📢 CMS & Announcements
- 🔐 JWT Authentication
- 📝 Audit Logs
			`,
			contact: {
				name: 'CarsonDev1',
				email: 'support@lms.com',
			},
			license: {
				name: 'ISC',
			},
		},
		servers: [
			{
				url: process.env.API_URL || 'http://backendlearning.xyz',
				description: 'Production server',
			},
			{
				url: 'http://localhost:5000',
				description: 'Local development',
			},
		],
		tags: [
			{ name: 'Courses', description: 'Course management' },
			{ name: 'Study Plans', description: 'Personalized study planning' },
			{ name: 'Roadmap', description: 'Learning roadmap & levels' },
			{ name: 'Gamification', description: 'XP, achievements, leaderboards' },
			{ name: 'Course Approvals', description: 'Course approval workflow' },
			{ name: 'CMS', description: 'Content management' },
			{ name: 'Announcements', description: 'Platform announcements' },
			{ name: 'Chatbot', description: 'AI chatbot support' },
			{ name: 'Analytics', description: 'Statistics & dashboards' },
			{ name: 'Audit Logs', description: 'Activity logging' },
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Enter your JWT token',
				},
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						success: {
							type: 'boolean',
							example: false,
						},
						message: {
							type: 'string',
							example: 'Error message',
						},
						errors: {
							type: 'array',
							items: {
								type: 'object',
							},
						},
					},
				},
				User: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							example: '507f1f77bcf86cd799439011',
						},
						name: {
							type: 'string',
							example: 'John Doe',
						},
						email: {
							type: 'string',
							example: 'john@example.com',
						},
						role: {
							type: 'string',
							enum: ['student', 'instructor', 'admin', 'reviewer'],
							example: 'student',
						},
						isEmailVerified: {
							type: 'boolean',
							example: false,
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
				StudyPlan: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						userId: { type: 'string' },
						courseId: { type: 'string' },
						title: { type: 'string' },
						dailyStudyMinutes: { type: 'number' },
						sessions: { type: 'array', items: { type: 'object' } },
						status: { type: 'string', enum: ['active', 'paused', 'completed'] },
					},
				},
				Achievement: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						code: { type: 'string' },
						name: { type: 'string' },
						description: { type: 'string' },
						type: { type: 'string' },
						xpReward: { type: 'number' },
						cupsReward: { type: 'number' },
					},
				},
				UserProgress: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						userId: { type: 'string' },
						level: { type: 'number' },
						xp: { type: 'number' },
						cups: { type: 'number' },
						currentStreak: { type: 'number' },
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
