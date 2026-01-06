// ════════════════════════════════════════════════════════════════
//                    Manifest Routes
//                    Dashboard Backend
// ════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { z } from 'zod';
import { manifestService } from '../services/manifest.service.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';

export const manifestRouter = Router();

// Validation schemas
const createManifestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  screens: z.array(z.object({
    id: z.string(),
    name: z.string(),
    route: z.string(),
    components: z.array(z.any()),
  })),
});

const updateManifestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  screens: z.array(z.object({
    id: z.string(),
    name: z.string(),
    route: z.string(),
    components: z.array(z.any()),
  })).optional(),
});

// GET /api/manifests
manifestRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const result = await manifestService.list(req.user!.tenantId, {
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/manifests/:id
manifestRouter.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const manifest = await manifestService.getById(req.params.id, req.user!.tenantId);

    res.json({
      success: true,
      data: manifest,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/manifests
manifestRouter.post(
  '/',
  requireRole('Admin', 'Developer'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = createManifestSchema.parse(req.body);
      const manifest = await manifestService.create(
        req.user!.tenantId,
        req.user!.userId,
        data
      );

      res.status(201).json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/manifests/:id
manifestRouter.put(
  '/:id',
  requireRole('Admin', 'Developer'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = updateManifestSchema.parse(req.body);
      const manifest = await manifestService.update(
        req.params.id,
        req.user!.tenantId,
        data
      );

      res.json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/manifests/:id/publish
manifestRouter.post(
  '/:id/publish',
  requireRole('Admin', 'Developer'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const manifest = await manifestService.publish(req.params.id, req.user!.tenantId);

      res.json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/manifests/:id/archive
manifestRouter.post(
  '/:id/archive',
  requireRole('Admin'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const manifest = await manifestService.archive(req.params.id, req.user!.tenantId);

      res.json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/manifests/:id/rollback
manifestRouter.post(
  '/:id/rollback',
  requireRole('Admin', 'Developer'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { version } = z.object({ version: z.string() }).parse(req.body);
      const manifest = await manifestService.rollback(
        req.params.id,
        req.user!.tenantId,
        version
      );

      res.json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);
