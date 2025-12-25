import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { getRedisClient } from "../config/redis";
import { ethers } from "ethers";
import crypto from "crypto";
import * as emailService from "./email.service";
import * as smsService from "./sms.service";
import { checkAndAwardAchievements } from "../controllers/achievement.controller";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function loginWithWallet(data: {
  walletAddress: string;
  signature: string;
  message: string;
}) {
  // Verify signature
  try {
    const recoveredAddress = ethers.verifyMessage(data.message, data.signature);
    
    if (recoveredAddress.toLowerCase() !== data.walletAddress.toLowerCase()) {
      throw new AppError('Invalid signature', 401);
    }
  } catch (error) {
    logger.error('Signature verification failed:', error);
    throw new AppError('Invalid signature', 401);
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { walletAddress: data.walletAddress.toLowerCase() },
  });

  if (!user) {
    // Create new user with wallet
    user = await prisma.user.create({
      data: {
        username: `user_${data.walletAddress.slice(0, 8)}`,
        walletAddress: data.walletAddress.toLowerCase(),
        lastLogin: new Date(),
      },
    });
    logger.info(`New user created via wallet: ${user.username}`);

    // Award account creation achievement
    await checkAndAwardAchievements(user.id).catch(err => {
      logger.error('Failed to award achievements:', err);
    });
  } else {
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  }

  // Generate token
  const token = generateToken(user.id);

  logger.info(`User logged in via wallet: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      avatar: user.avatar,
    },
    token,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      walletAddress: true,
      displayName: true,
      avatar: true,
      createdAt: true,
      lastLogin: true,
      _count: {
        select: {
          predictions: true,
          payments: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    username?: string;
    displayName?: string;
    avatar?: string;
    email?: string;
    phoneNumber?: string;
    walletAddress?: string;
  }
) {
  // First, fetch the current user
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      phoneNumber: true,
      walletAddress: true,
    },
  });

  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  // Check for unique username if username is being changed
  if (updates.username && updates.username !== currentUser.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: updates.username },
    });

    if (existingUser) {
      throw new AppError('Username is already taken', 400);
    }
  }

  // Prevent changing any field once it's set (they're locked permanently)
  if (currentUser.email && updates.email && updates.email !== currentUser.email) {
    throw new AppError('Email is locked and cannot be changed', 400);
  }

  if (currentUser.phoneNumber && updates.phoneNumber && updates.phoneNumber !== currentUser.phoneNumber) {
    throw new AppError('Phone number is locked and cannot be changed', 400);
  }

  if (currentUser.walletAddress && updates.walletAddress && updates.walletAddress !== currentUser.walletAddress) {
    throw new AppError('Wallet address is locked and cannot be changed', 400);
  }

  // Check if email/phone/wallet being added already exists
  if (updates.email && !currentUser.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: updates.email },
    });
    if (existingEmail) {
      throw new AppError('Email is already registered to another account', 400);
    }
  }

  if (updates.phoneNumber && !currentUser.phoneNumber) {
    const existingPhone = await prisma.user.findUnique({
      where: { phoneNumber: updates.phoneNumber },
    });
    if (existingPhone) {
      throw new AppError('Phone number is already registered to another account', 400);
    }
  }

  if (updates.walletAddress && !currentUser.walletAddress) {
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress: updates.walletAddress },
    });
    if (existingWallet) {
      throw new AppError('Wallet address is already registered to another account', 400);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      username: true,
      email: true,
      phoneNumber: true,
      walletAddress: true,
      displayName: true,
      avatar: true,
    },
  });

  logger.info(`User profile updated: ${user.username}`);

  return user;
}

export async function addEmailToProfile(userId: string, email: string) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.email) {
    throw new AppError('Email is already set and cannot be changed', 400);
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new AppError('Email is already registered to another account', 400);
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store the pending email and verification token
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry,
    },
  });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await emailService.sendVerificationEmail(email, user.username, verificationUrl);

  logger.info(`Email verification sent to ${email} for user ${user.username}`);
}

export async function addPhoneToProfile(userId: string, phoneNumber: string) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneNumber: true, id: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.phoneNumber) {
    throw new AppError('Phone number is already set and cannot be changed', 400);
  }

  // Check if phone already exists
  const existingPhone = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (existingPhone) {
    throw new AppError('Phone number is already registered to another account', 400);
  }

  // Generate OTP
  const otp = smsService.generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Temporarily store the pending phone number in a separate field
  // We'll use phoneNumber field after verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      phoneNumber: phoneNumber, // Store it so verification can find it
      phoneVerified: false,
      phoneVerificationCode: otp,
      phoneVerificationExpires: otpExpires,
    },
  });

  // Send OTP via SMS
  await smsService.sendOTP(phoneNumber, otp);

  logger.info(`OTP sent to ${phoneNumber} for adding to user profile ${userId}`);
}

export async function sendPasswordResetEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true, email: true, password: true, authProvider: true },
  });

  if (!user) {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    throw new AppError('No account found with this email address', 404);
  }

  // Check if user registered with email (has password or should have password)
  if (user.authProvider !== 'email' && !user.password) {
    throw new AppError('This account uses a different login method (phone, wallet, or Google). Password reset is not available.', 400);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  // Send reset email
  await emailService.sendPasswordResetEmail(email, resetToken, user.username);

  logger.info(`Password reset email sent to ${email}`);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password, clear reset token, and verify email if not already verified
  // (User proved they have access to the email by clicking the reset link)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  logger.info(`Password reset successfully for user: ${user.username}`);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.password) {
    throw new AppError('Cannot change password for this account', 400);
  }

  // Verify current password
  const validPassword = await bcrypt.compare(currentPassword, user.password);
  if (!validPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logger.info(`Password changed for user: ${user.username}`);
}

export async function invalidateToken(token: string) {
  const redis = getRedisClient();
  // Add token to blacklist with expiry
  await redis.setex(`blacklist:${token}`, 7 * 24 * 60 * 60, '1');
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const redis = getRedisClient();
  const result = await redis.get(`blacklist:${token}`);
  return result === '1';
}

function generateToken(userId: string): string {
  return jwt.sign(
    { userId }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

export function verifyToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

// ==================== EMAIL AUTHENTICATION ====================

/**
 * Register user with email and send verification email
 */
export async function registerWithEmail(data: {
  username: string;
  email: string;
  password: string;
}) {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.email },
      ],
    },
  });

  if (existingUser) {
    throw new AppError('User with given username or email already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      authProvider: 'email',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      lastLogin: new Date(),
    },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(data.email, verificationToken, data.username);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  // Award account creation achievement
  await checkAndAwardAchievements(user.id).catch(err => {
    logger.error('Failed to award achievements:', err);
  });

  logger.info(`User registered with email: ${user.username}`);

  return {
    user,
    message: 'Registration successful. Please check your email to verify your account.',
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  // Generate token for auto-login
  const authToken = generateToken(user.id);

  logger.info(`Email verified for user: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: true,
    },
    token: authToken,
    message: 'Email verified successfully',
  };
}

/**
 * Login with email
 */
export async function loginWithEmail(data: { email: string; password: string }) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.password) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate token
  const token = generateToken(user.id);

  logger.info(`User logged in with email: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      avatar: user.avatar,
    },
    token,
  };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  // Send email
  await emailService.sendVerificationEmail(email, verificationToken, user.username);

  logger.info(`Verification email resent to: ${email}`);

  return {
    message: 'Verification email sent successfully',
  };
}

// ==================== PHONE AUTHENTICATION ====================

/**
 * Register with phone number and send OTP
 */
export async function registerWithPhone(data: {
  phoneNumber: string;
  username: string;
}) {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { phoneNumber: data.phoneNumber },
      ],
    },
  });

  if (existingUser) {
    throw new AppError('User with given username or phone number already exists', 400);
  }

  // Generate OTP
  const otp = smsService.generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create user (unverified)
  const user = await prisma.user.create({
    data: {
      username: data.username,
      phoneNumber: data.phoneNumber,
      authProvider: 'phone',
      phoneVerificationCode: otp,
      phoneVerificationExpires: otpExpires,
      lastLogin: new Date(),
    },
    select: {
      id: true,
      username: true,
      phoneNumber: true,
      phoneVerified: true,
      createdAt: true,
    },
  });

  // Send OTP
  try {
    await smsService.sendOTP(data.phoneNumber, otp);
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    // Delete user if SMS fails
    await prisma.user.delete({ where: { id: user.id } });
    throw new AppError('Failed to send verification code. Please try again.', 500);
  }

  logger.info(`User registered with phone: ${user.username}`);

  return {
    userId: user.id,
    message: 'Verification code sent to your phone number',
  };
}

/**
 * Verify phone with OTP
 */
export async function verifyPhone(data: { phoneNumber: string; code: string }) {
  const user = await prisma.user.findFirst({
    where: {
      phoneNumber: data.phoneNumber,
      phoneVerificationCode: data.code,
      phoneVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerified: true,
      phoneVerificationCode: null,
      phoneVerificationExpires: null,
    },
  });

  // Generate token for auto-login
  const token = generateToken(user.id);

  // Award account creation achievement
  await checkAndAwardAchievements(user.id).catch(err => {
    logger.error('Failed to award achievements:', err);
  });

  logger.info(`Phone verified for user: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      phoneVerified: true,
    },
    token,
    message: 'Phone verified successfully',
  };
}

/**
 * Login with phone - send OTP
 */
export async function loginWithPhone(phoneNumber: string) {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.phoneVerified) {
    throw new AppError('Phone number not verified', 403);
  }

  // Generate OTP
  const otp = smsService.generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with new OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerificationCode: otp,
      phoneVerificationExpires: otpExpires,
    },
  });

  // Send OTP
  await smsService.sendOTP(phoneNumber, otp);

  logger.info(`Login OTP sent to: ${phoneNumber}`);

  return {
    message: 'Verification code sent to your phone number',
  };
}

/**
 * Verify OTP for login
 */
export async function verifyLoginOTP(data: { phoneNumber: string; code: string }) {
  const user = await prisma.user.findFirst({
    where: {
      phoneNumber: data.phoneNumber,
      phoneVerificationCode: data.code,
      phoneVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  // Clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerificationCode: null,
      phoneVerificationExpires: null,
      lastLogin: new Date(),
    },
  });

  // Generate token
  const token = generateToken(user.id);

  logger.info(`User logged in with phone: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      displayName: user.displayName,
      avatar: user.avatar,
    },
    token,
  };
}

/**
 * Resend OTP
 */
export async function resendOTP(phoneNumber: string) {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new OTP
  const otp = smsService.generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerificationCode: otp,
      phoneVerificationExpires: otpExpires,
    },
  });

  // Send OTP
  await smsService.sendOTP(phoneNumber, otp);

  logger.info(`OTP resent to: ${phoneNumber}`);

  return {
    message: 'Verification code sent successfully',
  };
}

// ==================== GOOGLE OAUTH AUTHENTICATION ====================

/**
 * Login or register with Google OAuth
 */
export async function loginWithGoogle(data: {
  googleId: string;
  email: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
}) {
  // Check if user exists with Google ID
  let user = await prisma.user.findUnique({
    where: { googleId: data.googleId },
  });

  if (!user) {
    // Check if email is already used
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email is already registered with another method', 400);
    }

    // Create new user
    const username = `user_${crypto.randomBytes(4).toString('hex')}`;

    user = await prisma.user.create({
      data: {
        username,
        email: data.email,
        googleId: data.googleId,
        displayName: data.displayName,
        avatar: data.avatar,
        phoneNumber: data.phoneNumber,
        authProvider: 'google',
        emailVerified: true, // Google emails are pre-verified
        lastLogin: new Date(),
      },
    });

    logger.info(`New user created via Google: ${user.username}`);

    // Award account creation achievement
    await checkAndAwardAchievements(user.id).catch(err => {
      logger.error('Failed to award achievements:', err);
    });
  } else {
    // Update last login and optionally update profile info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        displayName: data.displayName || user.displayName,
        avatar: data.avatar || user.avatar,
        phoneNumber: data.phoneNumber || user.phoneNumber,
      },
    });
  }

  // Generate token
  const token = generateToken(user.id);

  logger.info(`User logged in via Google: ${user.username}`);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
    },
    token,
  };
}