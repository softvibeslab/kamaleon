// ════════════════════════════════════════════════════════════════
//                    Health Check Routes
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { config } from '../config/index.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'kamaleon-gateway',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    },
  });
});

healthRouter.get('/ready', async (req, res) => {
  const services = {
    dashboard: false,
    sync: false,
  };

  try {
    const dashboardCheck = await fetch(`${config.services.dashboard}/api/health`);
    services.dashboard = dashboardCheck.ok;
  } catch {
    services.dashboard = false;
  }

  try {
    const syncCheck = await fetch(`${config.services.sync}/api/health`);
    services.sync = syncCheck.ok;
  } catch {
    services.sync = false;
  }

  const allHealthy = Object.values(services).every(Boolean);

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    data: {
      status: allHealthy ? 'ready' : 'degraded',
      services,
      timestamp: new Date().toISOString(),
    },
  });
});
