// ════════════════════════════════════════════════════════════════
//                    Authentication Middleware
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  deviceId?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      req.user = decoded;
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
};

export const deviceAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: 'Missing device ID header',
    });
  }

  req.deviceId = deviceId;
  next();
};
