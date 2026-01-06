// ════════════════════════════════════════════════════════════════
//                    User Routes
//                    Dashboard Backend
// ════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
export const userRouter = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
  role: z.enum(['Admin', 'Developer', 'Viewer']),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['Admin', 'Developer', 'Viewer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// GET /api/users - List users (Admin only)
userRouter.get(
  '/',
  requireRole('Admin'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const users = await prisma.user.findMany({
        where: { tenantId: req.user!.tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Get user by ID
userRouter.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create user (Admin only)
userRouter.post(
  '/',
  requireRole('Admin'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = createUserSchema.parse(req.body);

      // Check if email already exists
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use',
        });
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: hashedPassword,
          role: data.role,
          tenantId: req.user!.tenantId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/users/:id - Update user (Admin only)
userRouter.put(
  '/:id',
  requireRole('Admin'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = updateUserSchema.parse(req.body);

      const user = await prisma.user.updateMany({
        where: {
          id: req.params.id,
          tenantId: req.user!.tenantId,
        },
        data,
      });

      if (user.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const updated = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/:id - Deactivate user (Admin only)
userRouter.delete(
  '/:id',
  requireRole('Admin'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      // Don't allow deleting yourself
      if (req.params.id === req.user!.userId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
        });
      }

      const user = await prisma.user.updateMany({
        where: {
          id: req.params.id,
          tenantId: req.user!.tenantId,
        },
        data: {
          status: 'inactive',
        },
      });

      if (user.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deactivated',
      });
    } catch (error) {
      next(error);
    }
  }
);
