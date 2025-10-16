/**
 * API routes configuration
 */

import { Router } from 'express';
import { authRoutes } from './auth.js';
import { documentRoutes } from './documents.js';
import { queryRoutes } from './queries.js';
import { ollamaRoutes } from './ollama.js';
import { userRoutes } from './users.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/queries', queryRoutes);
router.use('/ollama', ollamaRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
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
