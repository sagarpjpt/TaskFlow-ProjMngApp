const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailTemplates = {
  verificationOTP: (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-box { background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .otp { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with our Bug Tracker application. Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name, resetLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password. Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Or copy and paste this link into your browser:<br>${resetLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  ticketAssigned: (userName, ticketTitle, ticketId, projectName, assignedBy) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .ticket-info { background: white; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Ticket Assigned</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>A new ticket has been assigned to you by <strong>${assignedBy}</strong>.</p>
          <div class="ticket-info">
            <h3>${ticketTitle}</h3>
            <p><strong>Project:</strong> ${projectName}</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
          </div>
          <p>Please log in to your dashboard to view the full details and start working on it.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  ticketStatusChanged: (userName, ticketTitle, oldStatus, newStatus, changedBy, projectName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .status-change { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ticket Status Updated</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p><strong>${changedBy}</strong> has updated the status of a ticket assigned to you.</p>
          <div class="status-change">
            <h3>${ticketTitle}</h3>
            <p><strong>Project:</strong> ${projectName}</p>
            <p><strong>Status changed:</strong> ${oldStatus} → ${newStatus}</p>
          </div>
          <p>Log in to your dashboard for more details.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  newComment: (userName, ticketTitle, commenterName, commentText, projectName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .comment-box { background: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Comment on Ticket</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p><strong>${commenterName}</strong> commented on a ticket you're involved with.</p>
          <div class="comment-box">
            <h3>${ticketTitle}</h3>
            <p><strong>Project:</strong> ${projectName}</p>
            <p><strong>Comment:</strong></p>
            <p style="font-style: italic;">"${commentText}"</p>
          </div>
          <p>Log in to reply or view the full conversation.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  addedToProject: (userName, projectName, addedBy, projectDescription) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .project-info { background: white; padding: 15px; border-left: 4px solid #8B5CF6; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Added to Project</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p><strong>${addedBy}</strong> has added you to a project.</p>
          <div class="project-info">
            <h3>${projectName}</h3>
            ${projectDescription ? `<p>${projectDescription}</p>` : ''}
          </div>
          <p>You can now access this project and start collaborating with your team members.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bug Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = {
  sendEmail,
  generateOTP,
  emailTemplates,
};
