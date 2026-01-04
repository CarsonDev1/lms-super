import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		refreshToken: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		userAgent: {
			type: String,
			default: null,
		},
		ipAddress: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Auto delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
