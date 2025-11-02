import { z } from 'zod';

/**
 * JWT token payload schema
 */
export const JwtPayloadSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  roles: z.array(z.enum(['admin', 'user', 'viewer'])),
  permissions: z.array(z.string()),
  sessionId: z.string().min(1),
  iat: z.number(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

/**
 * Authentication credentials schema
 */
export const CredentialsSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

/**
 * API key authentication schema
 */
export const ApiKeyCredentialsSchema = z.object({
  apiKey: z.string().min(1).max(200),
});

export type ApiKeyCredentials = z.infer<typeof ApiKeyCredentialsSchema>;

/**
 * User information schema
 */
export const UserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1).max(50),
  email: z.string().email(),
  roles: z.array(z.enum(['admin', 'user', 'viewer'])),
  permissions: z.array(z.string()),
  createdAt: z.date(),
  lastLogin: z.date().optional(),
  active: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Session information schema
 */
export const SessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  createdAt: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Authentication result schema
 */
export const AuthResultSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  token: z.string().optional(),
  session: SessionSchema.optional(),
  error: z.string().optional(),
  errorCode: z
    .enum(['INVALID_CREDENTIALS', 'USER_INACTIVE', 'SESSION_EXPIRED', 'INVALID_TOKEN'])
    .optional(),
});

export type AuthResult = z.infer<typeof AuthResultSchema>;

/**
 * Security context schema
 */
export const SecurityContextSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  roles: z.array(z.enum(['admin', 'user', 'viewer'])),
  permissions: z.array(z.string()),
  sessionId: z.string().min(1),
  authenticated: z.boolean(),
  timestamp: z.date(),
});

export type SecurityContext = z.infer<typeof SecurityContextSchema>;

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Actor permissions
  ACTOR_CREATE: 'actor:create',
  ACTOR_READ: 'actor:read',
  ACTOR_UPDATE: 'actor:update',
  ACTOR_DELETE: 'actor:delete',
  ACTOR_TICK: 'actor:tick',
  ACTOR_START: 'actor:start',
  ACTOR_STOP: 'actor:stop',

  // Context permissions
  CONTEXT_CREATE: 'context:create',
  CONTEXT_READ: 'context:read',
  CONTEXT_UPDATE: 'context:update',
  CONTEXT_DELETE: 'context:delete',
  CONTEXT_COMPILE: 'context:compile',

  // Tool permissions
  TOOL_EXECUTE: 'tool:execute',
  TOOL_READ: 'tool:read',

  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_CONFIG: 'system:config',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role definitions with default permissions
 */
export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  user: [
    PERMISSIONS.ACTOR_CREATE,
    PERMISSIONS.ACTOR_READ,
    PERMISSIONS.ACTOR_UPDATE,
    PERMISSIONS.ACTOR_TICK,
    PERMISSIONS.ACTOR_START,
    PERMISSIONS.ACTOR_STOP,
    PERMISSIONS.CONTEXT_CREATE,
    PERMISSIONS.CONTEXT_READ,
    PERMISSIONS.CONTEXT_UPDATE,
    PERMISSIONS.CONTEXT_COMPILE,
    PERMISSIONS.TOOL_EXECUTE,
    PERMISSIONS.TOOL_READ,
    PERMISSIONS.SYSTEM_MONITOR,
  ],
  viewer: [
    PERMISSIONS.ACTOR_READ,
    PERMISSIONS.CONTEXT_READ,
    PERMISSIONS.TOOL_READ,
    PERMISSIONS.SYSTEM_MONITOR,
  ],
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;
