// ════════════════════════════════════════════════════════════════
//                    Rate Limiting Middleware
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const mobileLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.mobileMax,
  keyGenerator: (req) => {
    return req.headers['x-device-id'] as string || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: 'Too many sync requests, please try again later',
    code: 'SYNC_RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
    code: 'AUTH_RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
