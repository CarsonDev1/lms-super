import mongoose from 'mongoose';

const courseApprovalSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		versionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CourseVersion',
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		submittedAt: {
			type: Date,
			default: Date.now,
		},
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		reviewedAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ['pending', 'under_review', 'approved', 'rejected', 'revision_required'],
			default: 'pending',
		},
		priority: {
			type: String,
			enum: ['low', 'medium', 'high', 'urgent'],
			default: 'medium',
		},
		submissionType: {
			type: String,
			enum: ['new', 'update', 'revision'],
			required: true,
		},
		submissionNotes: {
			type: String,
		},
		reviewNotes: {
			type: String,
		},
		feedback: [
			{
				reviewerId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				comment: {
					type: String,
					required: true,
				},
				type: {
					type: String,
					enum: ['suggestion', 'required_change', 'question', 'praise'],
				},
				section: {
					type: String,
				},
				status: {
					type: String,
					enum: ['pending', 'resolved', 'dismissed'],
					default: 'pending',
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		checklist: {
			contentQuality: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
			technicalAccuracy: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
			videoQuality: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
			materialsComplete: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
			curriculumStructure: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
			compliance: {
				checked: { type: Boolean, default: false },
				notes: String,
			},
		},
		rejectionReason: {
			type: String,
		},
		revisionDeadline: {
			type: Date,
		},
		history: [
			{
				action: {
					type: String,
					enum: ['submitted', 'reviewed', 'approved', 'rejected', 'revision_requested', 'resubmitted'],
				},
				by: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				at: {
					type: Date,
					default: Date.now,
				},
				notes: String,
			},
		],
	},
	{
		timestamps: true,
	}
);

// Indexes
courseApprovalSchema.index({ courseId: 1, status: 1 });
courseApprovalSchema.index({ submittedBy: 1 });
courseApprovalSchema.index({ reviewedBy: 1 });
courseApprovalSchema.index({ status: 1, submittedAt: -1 });

// Method to add feedback
courseApprovalSchema.methods.addFeedback = async function (reviewerId, comment, type, section) {
	this.feedback.push({
		reviewerId,
		comment,
		type,
		section,
		status: 'pending',
		createdAt: new Date(),
	});

	return this.save();
};

// Method to approve
courseApprovalSchema.methods.approve = async function (reviewerId, notes) {
	this.status = 'approved';
	this.reviewedBy = reviewerId;
	this.reviewedAt = new Date();
	this.reviewNotes = notes;

	this.history.push({
		action: 'approved',
		by: reviewerId,
		at: new Date(),
		notes,
	});

	return this.save();
};

// Method to reject
courseApprovalSchema.methods.reject = async function (reviewerId, reason, notes) {
	this.status = 'rejected';
	this.reviewedBy = reviewerId;
	this.reviewedAt = new Date();
	this.rejectionReason = reason;
	this.reviewNotes = notes;

	this.history.push({
		action: 'rejected',
		by: reviewerId,
		at: new Date(),
		notes: reason,
	});

	return this.save();
};

// Method to request revision
courseApprovalSchema.methods.requestRevision = async function (reviewerId, feedback, deadline) {
	this.status = 'revision_required';
	this.reviewedBy = reviewerId;
	this.reviewedAt = new Date();
	this.revisionDeadline = deadline;

	this.history.push({
		action: 'revision_requested',
		by: reviewerId,
		at: new Date(),
		notes: feedback,
	});

	return this.save();
};

const CourseApproval = mongoose.model('CourseApproval', courseApprovalSchema);

export default CourseApproval;
