import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST || 'smtp.gmail.com',
			port: parseInt(process.env.EMAIL_PORT) || 587,
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	async sendEmail({ to, subject, html, text }) {
		try {
			const mailOptions = {
				from: `"LMS Platform" <${process.env.EMAIL_USER}>`,
				to,
				subject,
				html,
				text,
			};

			const info = await this.transporter.sendMail(mailOptions);
			logger.info(`Email sent: ${info.messageId}`);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			logger.error('Email sending failed:', error);
			return { success: false, error: error.message };
		}
	}

	// Welcome email for new users
	async sendWelcomeEmail(user) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">Welcome to LMS Platform!</h1>
				<p>Hi ${user.name},</p>
				<p>Thank you for joining our Learning Management System. We're excited to have you on board!</p>
				<p>You can now:</p>
				<ul>
					<li>Browse thousands of courses</li>
					<li>Track your learning progress</li>
					<li>Earn certificates</li>
					<li>Connect with instructors</li>
				</ul>
				<p>Get started by exploring our course catalog.</p>
				<p>Best regards,<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: 'Welcome to LMS Platform',
			html,
			text: `Welcome to LMS Platform, ${user.name}!`,
		});
	}

	// Enrollment confirmation
	async sendEnrollmentConfirmation(user, course) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">Enrollment Confirmed!</h1>
				<p>Hi ${user.name},</p>
				<p>You have successfully enrolled in:</p>
				<h2 style="color: #0066cc;">${course.title}</h2>
				<p>Start learning now and track your progress in your dashboard.</p>
				<a href="${process.env.FRONTEND_URL}/courses/${course._id}" 
				   style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
					Go to Course
				</a>
				<p>Happy learning!<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: `Enrollment Confirmed: ${course.title}`,
			html,
		});
	}

	// Certificate issued
	async sendCertificateEmail(user, course, certificateUrl) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">🎉 Congratulations!</h1>
				<p>Hi ${user.name},</p>
				<p>You have successfully completed:</p>
				<h2 style="color: #0066cc;">${course.title}</h2>
				<p>Your certificate is ready! Download it from your dashboard or click below:</p>
				<a href="${certificateUrl}" 
				   style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
					Download Certificate
				</a>
				<p>Share your achievement with friends and on social media!</p>
				<p>Best regards,<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: `Certificate Ready: ${course.title}`,
			html,
		});
	}

	// Payment confirmation
	async sendPaymentConfirmation(user, order, course) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">Payment Confirmed!</h1>
				<p>Hi ${user.name},</p>
				<p>Your payment has been successfully processed.</p>
				<h3>Order Details:</h3>
				<table style="width: 100%; border-collapse: collapse;">
					<tr>
						<td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
						<td style="padding: 8px; border: 1px solid #ddd;">${order.transactionId}</td>
					</tr>
					<tr>
						<td style="padding: 8px; border: 1px solid #ddd;"><strong>Course:</strong></td>
						<td style="padding: 8px; border: 1px solid #ddd;">${course.title}</td>
					</tr>
					<tr>
						<td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
						<td style="padding: 8px; border: 1px solid #ddd;">${order.finalAmount.toLocaleString()} VND</td>
					</tr>
					<tr>
						<td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
						<td style="padding: 8px; border: 1px solid #ddd;">${order.paymentMethod}</td>
					</tr>
				</table>
				<p>You can now access the course from your dashboard.</p>
				<p>Thank you for your purchase!<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: `Payment Confirmed - Order ${order.transactionId}`,
			html,
		});
	}

	// Course approved notification (for instructors)
	async sendCourseApprovedEmail(instructor, course) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">✅ Course Approved!</h1>
				<p>Hi ${instructor.name},</p>
				<p>Great news! Your course has been approved and is now published:</p>
				<h2 style="color: #0066cc;">${course.title}</h2>
				<p>Your course is now visible to all students on the platform.</p>
				<a href="${process.env.FRONTEND_URL}/courses/${course._id}" 
				   style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
					View Course
				</a>
				<p>Keep creating amazing content!<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: instructor.email,
			subject: `Course Approved: ${course.title}`,
			html,
		});
	}

	// Course rejected notification (for instructors)
	async sendCourseRejectedEmail(instructor, course, reason) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">Course Review Feedback</h1>
				<p>Hi ${instructor.name},</p>
				<p>Your course "${course.title}" requires some changes before it can be published.</p>
				<h3>Reason:</h3>
				<p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545;">${reason}</p>
				<p>Please review the feedback and update your course. You can resubmit it for review once the changes are made.</p>
				<p>If you have questions, feel free to contact our support team.</p>
				<p>Best regards,<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: instructor.email,
			subject: `Course Review Feedback: ${course.title}`,
			html,
		});
	}

	// New comment notification
	async sendNewCommentEmail(user, course, comment) {
		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">New Comment on Your Course</h1>
				<p>Hi ${user.name},</p>
				<p>Someone commented on your course "${course.title}":</p>
				<blockquote style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0066cc;">
					${comment.content}
				</blockquote>
				<a href="${process.env.FRONTEND_URL}/courses/${course._id}#comments" 
				   style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
					View Comment
				</a>
				<p>Best regards,<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: `New comment on ${course.title}`,
			html,
		});
	}

	// Password reset email
	async sendPasswordResetEmail(user, resetToken) {
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #333;">Password Reset Request</h1>
				<p>Hi ${user.name},</p>
				<p>You requested to reset your password. Click the button below to reset it:</p>
				<a href="${resetUrl}" 
				   style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
					Reset Password
				</a>
				<p>This link will expire in 1 hour.</p>
				<p>If you didn't request this, please ignore this email.</p>
				<p>Best regards,<br>The LMS Team</p>
			</div>
		`;

		return this.sendEmail({
			to: user.email,
			subject: 'Password Reset Request',
			html,
		});
	}
}

export default new EmailService();
