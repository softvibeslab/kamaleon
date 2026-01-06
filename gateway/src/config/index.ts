// ════════════════════════════════════════════════════════════════
//                    Gateway Configuration
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

export const config = {
  port: parseInt(process.env.GATEWAY_PORT || '3000'),

  // Service URLs
  services: {
    dashboard: process.env.DASHBOARD_URL || 'http://localhost:3001',
    sync: process.env.SYNC_URL || 'http://localhost:3002',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'kamaleon-dev-secret-change-in-production',
    issuer: 'kamaleon-gateway',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    mobileMax: 500, // higher limit for mobile sync
  },

  // Redis (for distributed rate limiting)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  // CORS
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
  },
};
