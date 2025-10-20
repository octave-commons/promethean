/**
 * @license
 * Copyright (C) 2025 Promethean Technologies. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { config } from 'dotenv';
import { z } from 'zod';
import type { ServerConfig } from '../types/index.js';

// Load environment variables
config();

// Environment variable schema
const EnvSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
  AUTH_ENABLED: z.coerce.boolean().default(false),
  AUTH_BEARER_TOKEN: z.string().optional(),
  SSE_ENABLED: z.coerce.boolean().default(true),
  SSE_POLLING_INTERVAL: z.coerce.number().default(5000),
  OPENAPI_ENABLED: z.coerce.boolean().default(true),
  OPENAPI_PATH: z.string().default('/docs'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
const env = EnvSchema.parse(process.env);

/**
 * Create server configuration from environment variables
 */
export function createServerConfig(): ServerConfig {
  // Parse CORS origin
  let corsOrigin: string | string[] = env.CORS_ORIGIN;
  if (env.CORS_ORIGIN.includes(',')) {
    corsOrigin = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  }

  return {
    host: env.HOST,
    port: env.PORT,
    cors: {
      origin: corsOrigin,
      credentials: env.CORS_CREDENTIALS,
    },
    auth: {
      enabled: env.AUTH_ENABLED,
      bearerToken: env.AUTH_BEARER_TOKEN,
    },
    sse: {
      enabled: env.SSE_ENABLED,
      pollingInterval: env.SSE_POLLING_INTERVAL,
    },
    openapi: {
      enabled: env.OPENAPI_ENABLED,
      path: env.OPENAPI_PATH,
    },
  };
}

/**
 * Get log level from environment
 */
export function getLogLevel(): string {
  return env.LOG_LEVEL;
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvironment(): void {
  if (env.AUTH_ENABLED && !env.AUTH_BEARER_TOKEN) {
    throw new Error('AUTH_BEARER_TOKEN is required when AUTH_ENABLED is true');
  }
}

export default {
  createServerConfig,
  getLogLevel,
  validateEnvironment,
};
