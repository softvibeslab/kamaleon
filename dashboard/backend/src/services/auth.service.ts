// ════════════════════════════════════════════════════════════════
//                    Auth Service
//                    Dashboard Backend
// ════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-prod';
const ACCESS_TOKEN_TTL = '8h';
const REFRESH_TOKEN_TTL = '7d';

// Permission mapping by role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    'manifests:read', 'manifests:write', 'manifests:publish',
    'tenants:read', 'tenants:write',
    'users:read', 'users:write',
    'reports:read', 'reports:export',
  ],
  Developer: [
    'manifests:read', 'manifests:write', 'manifests:publish',
    'reports:read',
  ],
  Viewer: [
    'manifests:read',
    'reports:read',
  ],
};

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        avatarUrl: user.avatarUrl,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    };
  },

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      // Delete all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  },

  async refreshAccessToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
    }

    const user = storedToken.user;

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const newRefreshToken = await this.generateRefreshToken(user.id);
    const accessToken = this.generateAccessToken(user);
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      avatarUrl: user.avatarUrl,
    };
  },

  generateAccessToken(user: { id: string; email: string; role: string; tenantId: string }) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
  },

  async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return token;
  },
};
