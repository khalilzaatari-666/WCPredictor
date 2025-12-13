import { Resend } from 'resend';
import logger from '../utils/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'World Cup Predictor <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Resend
let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  logger.info('Resend email service initialized');
} else {
  logger.warn('Resend API key not found. Email service disabled.');
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  if (!resend) {
    logger.error('Resend not initialized');
    throw new Error('Email service is not configured');
  }

  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - World Cup 2026 Predictor',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 30px;
                background: white;
              }
              .button {
                display: inline-block;
                padding: 14px 35px;
                background: #667eea;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background: #5568d3;
              }
              .link-text {
                word-break: break-all;
                color: #667eea;
                font-size: 12px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                background: #f9f9f9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚽ Welcome to World Cup 2026 Predictor!</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${username}</strong>,</p>
                <p>Thank you for registering with World Cup 2026 Predictor! Please verify your email address to complete your registration and start making predictions.</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link-text">${verificationUrl}</p>
                <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 World Cup 2026 Predictor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${username},

Thank you for registering with World Cup 2026 Predictor!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

© 2024 World Cup 2026 Predictor
      `,
    });

    if (error) {
      logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }

    logger.info(`Verification email sent to ${email}. ID: ${data?.id}`);
  } catch (error: any) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  if (!resend) {
    logger.error('Resend not initialized');
    throw new Error('Email service is not configured');
  }

  const resetUrl = `${FRONTEND_URL}/forgot-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - World Cup 2026 Predictor',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 30px;
                background: white;
              }
              .button {
                display: inline-block;
                padding: 14px 35px;
                background: #667eea;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background: #5568d3;
              }
              .link-text {
                word-break: break-all;
                color: #667eea;
                font-size: 12px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                background: #f9f9f9;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${username}</strong>,</p>
                <p>You requested to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link-text">${resetUrl}</p>
                <p><strong>⏰ This link will expire in 1 hour.</strong></p>
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2024 World Cup 2026 Predictor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${username},

You requested to reset your password.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

© 2024 World Cup 2026 Predictor
      `,
    });

    if (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    logger.info(`Password reset email sent to ${email}. ID: ${data?.id}`);
  } catch (error: any) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<void> {
  if (!resend) {
    logger.warn('Resend not initialized - skipping welcome email');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: '⚽ Welcome to World Cup 2026 Predictor!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 30px;
                background: white;
              }
              .button {
                display: inline-block;
                padding: 14px 35px;
                background: #667eea;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                background: #f9f9f9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to World Cup 2026!</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${username}</strong>,</p>
                <p>Your email has been verified successfully! You're all set to start making your World Cup 2026 predictions.</p>
                <p>Here's what you can do:</p>
                <ul>
                  <li>✅ Make your tournament predictions</li>
                  <li>🏆 Compete with friends and other users</li>
                  <li>🎁 Win prizes and NFTs</li>
                  <li>📊 Track your prediction accuracy</li>
                </ul>
                <div style="text-align: center;">
                  <a href="${FRONTEND_URL}/predictions" class="button">Start Predicting</a>
                </div>
                <p>Good luck with your predictions!</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 World Cup 2026 Predictor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error('Error sending welcome email:', error);
      // Don't throw error for welcome email
      return;
    }

    logger.info(`Welcome email sent to ${email}. ID: ${data?.id}`);
  } catch (error: any) {
    logger.error('Error sending welcome email:', error);
    // Don't throw error for welcome email
  }
}
