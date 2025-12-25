import { Router } from 'express';
import {
  loginWithWallet,
  getProfile,
  updateProfile,
  changePassword,
  addEmailToProfile,
  addPhoneToProfile,
  logout,
  deleteAccount,
  registerWithEmail,
  verifyEmail,
  loginWithEmail,
  resendVerificationEmail,
  registerWithPhone,
  verifyPhone,
  loginWithPhone,
  verifyLoginOTP,
  resendOTP,
  initiateGoogleAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  walletLoginSchema,
  updateProfileSchema,
  changePasswordSchema,
  emailRegisterSchema,
  emailLoginSchema,
  verifyEmailSchema,
  phoneRegisterSchema,
  phoneVerifySchema,
  phoneLoginSchema,
  googleAuthSchema,
} from '../utils/validators';

const router = Router();

// Email Authentication
router.post('/email/register', validateRequest(emailRegisterSchema), registerWithEmail);
router.post('/email/verify', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/email/login', validateRequest(emailLoginSchema), loginWithEmail);
router.post('/email/resend-verification', resendVerificationEmail);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Phone Authentication
router.post('/phone/register', validateRequest(phoneRegisterSchema), registerWithPhone);
router.post('/phone/verify', validateRequest(phoneVerifySchema), verifyPhone);
router.post('/phone/login', validateRequest(phoneLoginSchema), loginWithPhone);
router.post('/phone/verify-login', validateRequest(phoneVerifySchema), verifyLoginOTP);
router.post('/phone/resend-otp', resendOTP);

// Google OAuth
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', googleAuthCallback);
router.post('/google/callback', validateRequest(googleAuthSchema), googleAuthCallback);

// Wallet Authentication
router.post('/wallet-login', validateRequest(walletLoginSchema), loginWithWallet);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), updateProfile);
router.post('/profile/add-email', authMiddleware, addEmailToProfile);
router.post('/profile/add-phone', authMiddleware, addPhoneToProfile);
router.put('/change-password', authMiddleware, validateRequest(changePasswordSchema), changePassword);
router.post('/logout', authMiddleware, logout);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
