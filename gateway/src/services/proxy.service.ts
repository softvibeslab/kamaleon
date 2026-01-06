// ════════════════════════════════════════════════════════════════
//                    Proxy Service
//                    Kamaleon API Gateway
// ════════════════════════════════════════════════════════════════

import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config/index.js';

const createProxy = (target: string, pathRewrite?: Record<string, string>) => {
  const options: Options = {
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward authentication headers
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        // Forward tenant context
        if (req.headers['x-tenant-id']) {
          proxyReq.setHeader('X-Tenant-Id', req.headers['x-tenant-id']);
        }
        // Forward device ID for mobile requests
        if (req.headers['x-device-id']) {
          proxyReq.setHeader('X-Device-Id', req.headers['x-device-id']);
        }
      },
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Service temporarily unavailable',
            code: 'PROXY_ERROR',
          }));
        }
      },
    },
  };
  return createProxyMiddleware(options);
};

export const dashboardProxy = createProxy(
  config.services.dashboard,
  { '^/api/dashboard': '/api' }
);

export const syncProxy = createProxy(
  config.services.sync,
  { '^/api/sync': '/api' }
);
