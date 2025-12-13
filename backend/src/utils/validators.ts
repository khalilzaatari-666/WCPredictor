import { z } from 'zod';

// Wallet Auth validator
export const walletLoginSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string(),
  message: z.string(),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format').optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
});

// Email Auth validators
export const emailRegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// Phone Auth validators
export const phoneRegisterSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +1234567890)'),
  username: z.string().min(3).max(50),
});

export const phoneLoginSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format'),
});

export const phoneVerifySchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format'),
  code: z.string().length(6).regex(/^\d{6}$/, 'Code must be 6 digits'),
});

// Google Auth validators
export const googleAuthSchema = z.object({
  googleId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  avatar: z.string().url().optional(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format').optional(),
});

// Prediction validators
export const predictionSchema = z.object({
  groupStandings: z.record(z.array(z.string()).length(4)),
  thirdPlaceTeams: z.array(z.string()).length(8),
  roundOf32: z.record(z.any()).optional(),
  roundOf16: z.record(z.any()).optional(),
  quarterFinals: z.record(z.any()).optional(),
  semiFinals: z.record(z.any()).optional(),
  final: z.record(z.any()).optional(),
  thirdPlace: z.record(z.any()).optional(),
  champion: z.string().optional(),
  runnerUp: z.string().optional(),
});

export const updatePredictionSchema = z.object({
  groupStandings: z.record(z.array(z.string())).optional(),
  thirdPlaceTeams: z.array(z.string()).optional(),
  roundOf32: z.record(z.any()).optional(),
  roundOf16: z.record(z.any()).optional(),
  quarterFinals: z.record(z.any()).optional(),
  semiFinals: z.record(z.any()).optional(),
  final: z.record(z.any()).optional(),
  champion: z.string().optional(),
});

// Payment validators
export const paymentIntentSchema = z.object({
  predictionId: z.string(),
});