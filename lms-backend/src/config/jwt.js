export const jwtConfig = {
	accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key',
	refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key',
	accessTokenExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
	refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
	issuer: process.env.JWT_ISSUER || 'lms-backend',
	audience: process.env.JWT_AUDIENCE || 'lms-client',
};

export default jwtConfig;
