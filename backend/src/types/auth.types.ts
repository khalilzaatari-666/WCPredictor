import { Request } from 'express';

export interface AuthRequest extends Request {
  headers: any;
  body: any;
  userId?: string;
  username?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  walletAddress?: string;
  displayName?: string;
  avatar?: string;
  createdAt: Date;
}

export interface WalletLoginData {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface EmailRegisterData {
  username: string;
  email: string;
  password: string;
}

export interface EmailLoginData {
  email: string;
  password: string;
}

export interface PhoneRegisterData {
  phoneNumber: string;
  username: string;
}

export interface PhoneVerifyData {
  phoneNumber: string;
  code: string;
}

export interface GoogleAuthData {
  googleId: string;
  email: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
}