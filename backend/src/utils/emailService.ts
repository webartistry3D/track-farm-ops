import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  toName: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"TrackFarmOps" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your TrackFarmOps password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">TrackFarmOps</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151;">Hi ${toName},</p>
          <p style="color: #374151;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            TrackFarmOps &mdash; Farm Operations Management
          </p>
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (
  toEmail: string,
  toName: string,
  verificationToken?: string
): Promise<void> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifySection = verificationToken
    ? `<p style="color: #374151;">Please verify your email address to activate all features:</p>
       <div style="text-align: center; margin: 24px 0;">
         <a href="${baseUrl}/verify-email?token=${verificationToken}"
            style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
           Verify Email Address
         </a>
       </div>`
    : `<div style="text-align: center; margin: 32px 0;">
         <a href="${baseUrl}/login"
            style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
           Go to Dashboard
         </a>
       </div>`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"TrackFarmOps" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Welcome to TrackFarmOps — verify your email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">TrackFarmOps</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Welcome, ${toName}!</h2>
          <p style="color: #374151;">Your TrackFarmOps account has been created successfully.</p>
          ${verifySection}
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            TrackFarmOps &mdash; Farm Operations Management
          </p>
        </div>
      </div>
    `,
  });
};
