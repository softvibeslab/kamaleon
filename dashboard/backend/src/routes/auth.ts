// ════════════════════════════════════════════════════════════════
//                    Auth Routes
//                    Dashboard Backend
// ════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    await authService.logout(req.user!.userId, refreshToken);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});
