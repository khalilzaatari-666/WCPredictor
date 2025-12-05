import { Request, Response, NextFunction } from 'express';
import { verifyToken, isTokenBlacklisted } from '../services/auth.service';
import { AppError } from './error.middleware';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers?.authorization ?? '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Auth middleware error:', error);
      next(new AppError('Invalid or expired token', 401));
    }
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers?.authorization ?? '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } catch (error) {
      // Continue without authentication
    }
  }

  next();
}