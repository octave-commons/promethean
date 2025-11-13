/**
 * API routes configuration
 */

import { Router } from 'express';
import { authRoutes } from './auth.js';
...
const router: Router = Router();
...
router.get('/', (_req, res) => {

  res.json({
    success: true,
    data: {
      name: 'Promethean Documentation System API',
      version: '1.0.0',
      description:
        'Backend API for the Promethean Framework documentation system with asynchronous Ollama access',
      endpoints: {
        auth: '/api/v1/auth',
        documents: '/api/v1/documents',
        queries: '/api/v1/queries',
        ollama: '/api/v1/ollama',
        users: '/api/v1/users',
      },
      documentation: '/api-docs',
      health: '/health',
    },
  });
});

export { router as setupRoutes };
