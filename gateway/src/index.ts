// ════════════════════════════════════════════════════════════════
//                    Kamaleon API Gateway
//                    Entry Point
// ════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { healthRouter } from './routes/health.js';
import { syncRouter } from './routes/sync.js';
import { dashboardProxy } from './services/proxy.service.js';
import { defaultLimiter, authLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(morgan('combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Health checks (no auth required)
app.use('/health', healthRouter);

// Rate limiting for auth endpoints
app.use('/api/auth', authLimiter);

// Dashboard API proxy (auth handled by dashboard service)
app.use('/api/dashboard', defaultLimiter, dashboardProxy);

// Mobile sync routes (with device auth)
app.use('/api/sync', syncRouter);

// Direct manifest proxy for authenticated requests
app.use('/api/manifests', defaultLimiter, authMiddleware, dashboardProxy);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal gateway error',
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           Kamaleon API Gateway                                 ║
║           Running on port ${config.port}                              ║
╠═══════════════════════════════════════════════════════════════╣
║  Routes:                                                       ║
║  - GET  /health          Health check                          ║
║  - GET  /health/ready    Readiness check                       ║
║  - *    /api/dashboard/* Dashboard proxy                       ║
║  - POST /api/sync/pull   Mobile sync pull                      ║
║  - POST /api/sync/push   Mobile sync push                      ║
║  - GET  /api/sync/manifests  Get published manifests           ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { app };
