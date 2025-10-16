/**
 * Ollama job management routes
 */

import { Router } from 'express';
import { ResponseHelper } from '../../shared/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// TODO: Implement Ollama routes
router.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    res.json(
      ResponseHelper.success({
        message: 'Ollama jobs list endpoint - TODO: Implement job listing logic',
      }),
    );
  }),
);

router.post(
  '/jobs',
  asyncHandler(async (req, res) => {
    res.json(
      ResponseHelper.success({
        message: 'Create Ollama job endpoint - TODO: Implement job creation logic',
      }),
    );
  }),
);

router.get(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    res.json(
      ResponseHelper.success({
        message: 'Get Ollama job endpoint - TODO: Implement job retrieval logic',
        id: req.params.id,
      }),
    );
  }),
);

router.delete(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    res.json(
      ResponseHelper.success({
        message: 'Cancel Ollama job endpoint - TODO: Implement job cancellation logic',
        id: req.params.id,
      }),
    );
  }),
);

router.get(
  '/models',
  asyncHandler(async (req, res) => {
    res.json(
      ResponseHelper.success({
        message: 'List Ollama models endpoint - TODO: Implement model listing logic',
      }),
    );
  }),
);

export { router as ollamaRoutes };
