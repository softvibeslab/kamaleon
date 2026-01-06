// ════════════════════════════════════════════════════════════════
//                    Sync Routes (Mobile)
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authMiddleware, deviceAuth } from '../middleware/auth.js';
import { mobileLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/index.js';

export const syncRouter = Router();

// Validation schemas
const syncRequestSchema = z.object({
  lastSyncAt: z.string().datetime().optional(),
  pendingChanges: z.array(z.object({
    id: z.string(),
    type: z.enum(['create', 'update', 'delete']),
    entity: z.string(),
    data: z.any(),
    timestamp: z.string().datetime(),
  })).optional(),
});

const manifestRequestSchema = z.object({
  manifestIds: z.array(z.string()).optional(),
  lastVersions: z.record(z.string()).optional(),
});

// Apply middleware to all sync routes
syncRouter.use(mobileLimiter);
syncRouter.use(deviceAuth);
syncRouter.use(authMiddleware);

// POST /api/sync/pull - Get updates from server
syncRouter.post('/pull', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lastSyncAt } = syncRequestSchema.parse(req.body);

    // Forward to sync service
    const response = await fetch(`${config.services.sync}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization!,
        'X-Device-Id': req.deviceId!,
        'X-Tenant-Id': req.user!.tenantId,
      },
      body: JSON.stringify({ lastSyncAt, deviceId: req.deviceId }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Sync pull error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync pull failed',
    });
  }
});

// POST /api/sync/push - Send local changes to server
syncRouter.post('/push', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pendingChanges } = syncRequestSchema.parse(req.body);

    if (!pendingChanges || pendingChanges.length === 0) {
      return res.json({
        success: true,
        data: { processed: 0, conflicts: [] },
      });
    }

    // Forward to sync service
    const response = await fetch(`${config.services.sync}/api/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization!,
        'X-Device-Id': req.deviceId!,
        'X-Tenant-Id': req.user!.tenantId,
      },
      body: JSON.stringify({ pendingChanges, deviceId: req.deviceId }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Sync push error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync push failed',
    });
  }
});

// GET /api/sync/manifests - Get latest manifests for device
syncRouter.get('/manifests', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Forward to dashboard service
    const response = await fetch(
      `${config.services.dashboard}/api/manifests?status=published`,
      {
        headers: {
          'Authorization': req.headers.authorization!,
          'X-Tenant-Id': req.user!.tenantId,
        },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Get manifests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manifests',
    });
  }
});

// POST /api/sync/manifests/check - Check for manifest updates
syncRouter.post('/manifests/check', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { manifestIds, lastVersions } = manifestRequestSchema.parse(req.body);

    // Forward to sync service for version checking
    const response = await fetch(`${config.services.sync}/api/manifests/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization!,
        'X-Device-Id': req.deviceId!,
        'X-Tenant-Id': req.user!.tenantId,
      },
      body: JSON.stringify({ manifestIds, lastVersions }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Manifest check error:', error);
    res.status(500).json({
      success: false,
      error: 'Manifest check failed',
    });
  }
});
