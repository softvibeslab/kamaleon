// ════════════════════════════════════════════════════════════════
//                    Kamaleon Dashboard Backend
//                    MVP Ecosistema
// ════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { manifestRouter } from './routes/manifests.js';
import { userRouter } from './routes/users.js';
import { errorHandler } from './middleware/error.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/manifests', authMiddleware, manifestRouter);
app.use('/api/users', authMiddleware, userRouter);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Dashboard Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

export default app;
