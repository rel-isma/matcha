import nodemailer from 'nodemailer';

// Handle multiple frontend URLs, use the primary one for emails
const FRONTEND_URLS = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000', 'http://10.30.246.128:3000'];
const PRIMARY_FRONTEND_URL = FRONTEND_URLS[0];

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${PRIMARY_FRONTEND_URL}/verify?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@matcha.com',
    to: email,
    subject: 'Verify your Matcha account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Welcome to Matcha!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for registering with Matcha. Please click the button below to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #007bff; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${PRIMARY_FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@matcha.com',
    to: email,
    subject: 'Reset your Matcha password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #666; line-height: 1.6;">
          You requested to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #007bff; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
