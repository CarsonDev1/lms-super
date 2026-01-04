import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'LMS Backend API',
			version: '1.0.0',
			description: 'Professional Learning Management System API with JWT Authentication',
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
				url: process.env.API_URL || 'http://localhost:5000',
				description: 'Development server',
			},
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
							enum: ['student', 'instructor', 'admin'],
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
