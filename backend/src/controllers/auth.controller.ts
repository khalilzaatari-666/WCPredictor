import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types/auth.types';

export const loginWithWallet = asyncHandler(async (req: Request, res: Response) => {
  const { walletAddress, signature, message } = req.body;

  const result = await authService.loginWithWallet({
    walletAddress,
    signature,
    message,
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const user = await authService.getUserProfile(userId);

  res.json({
    success: true,
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const updates = req.body;

  console.log('Update profile - userId:', userId);
  console.log('Update profile - updates:', updates);

  const user = await authService.updateUserProfile(userId, updates);

  res.json({
    success: true,
    data: { user },
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    await authService.invalidateToken(token);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ==================== EMAIL AUTHENTICATION ====================

export const registerWithEmail = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const result = await authService.registerWithEmail({ username, email, password });

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  const result = await authService.verifyEmail(token);

  res.json({
    success: true,
    data: result,
  });
});

export const loginWithEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginWithEmail({ email, password });

  res.json({
    success: true,
    data: result,
  });
});

export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.resendVerificationEmail(email);

  res.json({
    success: true,
    data: result,
  });
});

// ==================== PHONE AUTHENTICATION ====================

export const registerWithPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, username } = req.body;

  const result = await authService.registerWithPhone({ phoneNumber, username });

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const verifyPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;

  const result = await authService.verifyPhone({ phoneNumber, code });

  res.json({
    success: true,
    data: result,
  });
});

export const loginWithPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  const result = await authService.loginWithPhone(phoneNumber);

  res.json({
    success: true,
    data: result,
  });
});

export const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;

  const result = await authService.verifyLoginOTP({ phoneNumber, code });

  res.json({
    success: true,
    data: result,
  });
});

export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  const result = await authService.resendOTP(phoneNumber);

  res.json({
    success: true,
    data: result,
  });
});

// ==================== GOOGLE OAUTH AUTHENTICATION ====================

export const initiateGoogleAuth = asyncHandler(async (req: Request, res: Response) => {
  const redirectUri = req.query.redirect_uri as string || `${process.env.FRONTEND_URL}/auth/google/callback`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || '')}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(redirectUri)}`;

  res.redirect(googleAuthUrl);
});

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  // Handle both GET (from Google) and POST (from frontend)
  const authCode = req.query.code as string || req.body.code || req.body.googleToken;
  const frontendRedirect = req.query.state as string || req.body.redirect_uri || `${process.env.FRONTEND_URL}/auth/google/callback`;

  if (!authCode) {
    const errorUrl = `${frontendRedirect}?error=no_code`;
    return res.redirect(errorUrl);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
        grant_type: 'authorization_code',
      }),
    });

    interface GoogleTokenResponse {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      id_token?: string;
      refresh_token?: string;
    }

    const tokens = await tokenResponse.json() as GoogleTokenResponse;

    if (!tokens.access_token) {
      const errorUrl = `${frontendRedirect}?error=no_access_token`;
      return res.redirect(errorUrl);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    interface GoogleUserInfo {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    }

    const googleUser = await userInfoResponse.json() as GoogleUserInfo;

    const result = await authService.loginWithGoogle({
      googleId: googleUser.id,
      email: googleUser.email,
      displayName: googleUser.name,
      avatar: googleUser.picture,
      phoneNumber: undefined,
    });

    // If it's a GET request (from Google), redirect to frontend with token
    if (req.method === 'GET') {
      const successUrl = `${frontendRedirect}?token=${result.token}`;
      return res.redirect(successUrl);
    }

    // If it's a POST request (from frontend), return JSON
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const errorUrl = `${frontendRedirect}?error=${encodeURIComponent(error.message || 'authentication_failed')}`;
    return res.redirect(errorUrl);
  }
});