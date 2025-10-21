/**
 * Main server entry point for the Promethean Documentation System
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { ConfigManager, Logger } from '../shared/index.js';
import { connectDatabase } from './database/connection.js';
import { setupRoutes } from './routes/index.js';
import { setupWebSocket } from './websocket/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';

// Initialize configuration and logger
const config = ConfigManager.getInstance();
const logger = Logger.getInstance();

// Create Express app
const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: config.getServerConfig().cors.origin,
    credentials: config.getServerConfig().cors.credentials,
  },
});

// ============================================================================
// Middleware Setup
// ============================================================================

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS middleware
app.use(
  cors({
    origin: config.getServerConfig().cors.origin,
    credentials: config.getServerConfig().cors.credentials,
  }),
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// ============================================================================
// Swagger Documentation Setup
// ============================================================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Promethean Documentation System API',
      version: '1.0.0',
      description:
        'Backend API for the Promethean Framework documentation system with asynchronous Ollama access',
      contact: {
        name: 'Promethean Framework Team',
        email: 'team@promethean.dev',
      },
    },
    servers: [
      {
        url: `http://${config.getServerConfig().host}:${config.getServerConfig().port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================================================
// Health Check
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.getServerConfig().env,
  });
});

// ============================================================================
// API Routes
// ============================================================================

// Setup API routes
app.use('/api/v1', authMiddleware, setupRoutes());

// ============================================================================
// WebSocket Setup
// ============================================================================

setupWebSocket(io);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

async function startServer() {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    const serverConfig = config.getServerConfig();
    server.listen(serverConfig.port, serverConfig.host, () => {
      logger.info(`Server running on ${serverConfig.host}:${serverConfig.port}`);
      logger.info(`Environment: ${serverConfig.env}`);
      logger.info(`API Documentation: http://${serverConfig.host}:${serverConfig.port}/api-docs`);
      logger.info(`Health Check: http://${serverConfig.host}:${serverConfig.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connections
    // TODO: Implement database connection cleanup

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
}

// Start the server
if (require.main === module) {
  startServer();
}

export { app, server, io };
