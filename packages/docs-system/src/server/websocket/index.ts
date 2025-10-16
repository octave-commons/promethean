/**
 * WebSocket server setup and event handlers
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Logger, ConfigManager } from '../../shared/index.js';
import { AuthenticationError } from '../../types/index.js';
import { validateUser } from '../middleware/auth.js';

const logger = Logger.getInstance();
const config = ConfigManager.getInstance();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export function setupWebSocket(io: SocketIOServer): void {
  logger.info('Setting up WebSocket server');

  // Authentication middleware for WebSocket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token || typeof token !== 'string') {
        throw new AuthenticationError('No authentication token provided');
      }

      // Verify JWT token
      const authConfig = config.getAuthConfig();
      const decoded = jwt.verify(token, authConfig.jwtSecret) as any;

      if (!decoded.id || !decoded.email || !decoded.username) {
        throw new AuthenticationError('Invalid token structure');
      }

      // Validate user exists and is active
      const usersCollection = (await import('../database/connection.js')).getCollection('users');
      const user = await usersCollection.findOne(
        { _id: decoded.id, isActive: true },
        { projection: { _id: 1, email: 1, username: 1, role: 1, isActive: 1 } },
      );

      if (!user) {
        throw new AuthenticationError('User not found or inactive');
      }

      socket.userId = user._id.toString();
      socket.user = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      };

      logger.info('WebSocket user authenticated', {
        userId: socket.userId,
        username: socket.user.username,
        socketId: socket.id,
      });

      next();
    } catch (error) {
      logger.warn('WebSocket authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
      });
      next(new AuthenticationError('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      userId: socket.userId,
      username: socket.user?.username,
    });

    // Join user to their personal room for targeted messages
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join role-based rooms
    if (socket.user?.role) {
      socket.join(`role:${socket.user.role}`);
    }

    // Handle job status subscriptions
    socket.on('subscribe:jobs', () => {
      if (socket.userId) {
        socket.join(`jobs:${socket.userId}`);
        logger.debug('User subscribed to job updates', {
          userId: socket.userId,
          socketId: socket.id,
        });
      }
    });

    socket.on('unsubscribe:jobs', () => {
      if (socket.userId) {
        socket.leave(`jobs:${socket.userId}`);
        logger.debug('User unsubscribed from job updates', {
          userId: socket.userId,
          socketId: socket.id,
        });
      }
    });

    // Handle query status subscriptions
    socket.on('subscribe:queries', () => {
      if (socket.userId) {
        socket.join(`queries:${socket.userId}`);
        logger.debug('User subscribed to query updates', {
          userId: socket.userId,
          socketId: socket.id,
        });
      }
    });

    socket.on('unsubscribe:queries', () => {
      if (socket.userId) {
        socket.leave(`queries:${socket.userId}`);
        logger.debug('User unsubscribed from query updates', {
          userId: socket.userId,
          socketId: socket.id,
        });
      }
    });

    // Handle document update subscriptions
    socket.on('subscribe:documents', (documentId?: string) => {
      if (socket.userId) {
        if (documentId) {
          socket.join(`document:${documentId}`);
          logger.debug('User subscribed to document updates', {
            userId: socket.userId,
            documentId,
            socketId: socket.id,
          });
        } else {
          socket.join('documents:all');
          logger.debug('User subscribed to all document updates', {
            userId: socket.userId,
            socketId: socket.id,
          });
        }
      }
    });

    socket.on('unsubscribe:documents', (documentId?: string) => {
      if (socket.userId) {
        if (documentId) {
          socket.leave(`document:${documentId}`);
        } else {
          socket.leave('documents:all');
        }
        logger.debug('User unsubscribed from document updates', {
          userId: socket.userId,
          documentId,
          socketId: socket.id,
        });
      }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        userId: socket.userId,
        username: socket.user?.username,
        reason,
      });
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Promethean Documentation System',
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('WebSocket server setup completed');
}

// Helper functions for broadcasting events
export class WebSocketHelper {
  constructor(private io: SocketIOServer) {}

  // Send job update to specific user
  sendJobUpdate(userId: string, jobData: any): void {
    this.io.to(`jobs:${userId}`).emit('job:update', jobData);
  }

  // Send query update to specific user
  sendQueryUpdate(userId: string, queryData: any): void {
    this.io.to(`queries:${userId}`).emit('query:update', queryData);
  }

  // Send document update to subscribers
  sendDocumentUpdate(documentId: string, documentData: any): void {
    this.io.to(`document:${documentId}`).emit('document:update', documentData);
    this.io.to('documents:all').emit('document:update', documentData);
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Send system notification to all users
  sendSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    this.io.emit('system:notification', {
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  // Send notification to users with specific role
  sendRoleNotification(role: string, notification: any): void {
    this.io.to(`role:${role}`).emit('notification', notification);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  // Get connected users in specific room
  getConnectedUsersInRoom(room: string): number {
    return this.io.sockets.adapter.rooms.get(room)?.size || 0;
  }
}

let wsHelper: WebSocketHelper | null = null;

export function getWebSocketHelper(io: SocketIOServer): WebSocketHelper {
  if (!wsHelper) {
    wsHelper = new WebSocketHelper(io);
  }
  return wsHelper;
}
