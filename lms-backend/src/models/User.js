import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [50, 'Name cannot exceed 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
		},
		password: {
			type: String,
			required: function () {
				return !this.oauthProvider; // Password not required for OAuth users
			},
			minlength: [6, 'Password must be at least 6 characters'],
			select: false,
		},
		role: {
			type: String,
			enum: ['student', 'instructor', 'admin', 'reviewer', 'guest'],
			default: 'student',
		},
		permissions: {
			type: [String],
			default: [],
		},
		avatar: {
			type: String,
			default: null,
		},
		bio: {
			type: String,
			maxlength: [500, 'Bio cannot exceed 500 characters'],
		},
		phone: {
			type: String,
			trim: true,
		},
		oauthProvider: {
			type: String,
			enum: ['google', 'facebook', null],
			default: null,
		},
		oauthId: {
			type: String,
			default: null,
		},
		isOnline: {
			type: Boolean,
			default: false,
		},
		lastSeen: {
			type: Date,
			default: Date.now,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: {
			type: String,
			select: false,
		},
		emailVerificationExpires: {
			type: Date,
			select: false,
		},
		resetPasswordToken: {
			type: String,
			select: false,
		},
		resetPasswordExpires: {
			type: Date,
			select: false,
		},
		lastLogin: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		blockReason: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: function (doc, ret) {
				delete ret.password;
				delete ret.__v;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
		},
	}
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });
userSchema.index({ isOnline: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
	// Only hash if password is modified and exists
	if (!this.isModified('password') || !this.password) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		throw new Error('Password comparison failed');
	}
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
	return {
		id: this._id,
		name: this.name,
		email: this.email,
		role: this.role,
		avatar: this.avatar,
		isEmailVerified: this.isEmailVerified,
		createdAt: this.createdAt,
	};
};

const User = mongoose.model('User', userSchema);

export default User;
