import { z } from "zod";
import type { OmniServiceAppConfig } from "./app.js";

/**
 * Enhanced configuration schema for the Omni Service with authentication
 */
const OmniServiceConfigSchema = z.object({
  // Server configuration
  port: z.number().default(3000),
  host: z.string().default("0.0.0.0"),
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  logLevel: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  trustProxy: z.boolean().default(false),

  // CORS configuration
  cors: z.object({
    origin: z.union([z.string(), z.array(z.string()), z.boolean()]).default(false),
    credentials: z.boolean().default(true),
  }).optional(),

  // Rate limiting configuration
  rateLimit: z.object({
    max: z.number().default(100),
    timeWindow: z.string().default("1 minute"),
  }).optional(),

  // JWT configuration
  jwt: z.object({
    secret: z.string().min(32),
    algorithm: z.enum(["HS256", "RS256"]).default("HS256"),
    expiresIn: z.string().default("1h"),
    issuer: z.string().default("omni-service"),
    audience: z.string().default("omni-service"),
    refreshExpiresIn: z.string().default("7d"),
  }),

  // RBAC configuration
  rbac: z.object({
    defaultRoles: z.array(z.string()).default(["readonly"]),
    permissionsCacheTTL: z.number().default(300),
  }).optional(),

  // API key configuration
  apikey: z.object({
    enabled: z.boolean().default(true),
    headerName: z.string().default("x-api-key"),
    queryParam: z.string().optional(),
  }).optional(),

  // Session configuration
  session: z.object({
    enabled: z.boolean().default(true),
    cookieName: z.string().default("omni-token"),
    cookieOptions: z.object({
      httpOnly: z.boolean().default(true),
      secure: z.boolean().default(process.env.NODE_ENV === "production"),
      sameSite: z.enum(["strict", "lax", "none"]).default("strict"),
      maxAge: z.number().default(60 * 60 * 24), // 1 day
    }).default({}),
  }).optional(),

  // Adapter configuration
  adapters: z.object({
    rest: z.object({
      enabled: z.boolean().default(true),
      prefix: z.string().default("/api"),
      version: z.string().default("v1"),
    }).default({}),
    
    graphql: z.object({
      enabled: z.boolean().default(true),
      endpoint: z.string().default("/graphql"),
      playground: z.boolean().default(true),
    }).default({}),
    
    websocket: z.object({
      enabled: z.boolean().default(true),
      path: z.string().default("/ws"),
    }).default({}),
    
    mcp: z.object({
      enabled: z.boolean().default(true),
      prefix: z.string().default("/mcp"),
    }).default({}),
  }).default({}),
});

export type EnhancedOmniServiceConfig = z.infer<typeof OmniServiceConfigSchema>;

/**
 * Default configuration with authentication settings
 */
const defaultConfig: EnhancedOmniServiceConfig = {
  port: 3000,
  host: "0.0.0.0",
  nodeEnv: "development",
  logLevel: "info",
  trustProxy: false,
  
  adapters: {
    rest: { enabled: true, prefix: "/api", version: "v1" },
    graphql: { enabled: true, endpoint: "/graphql", playground: true },
    websocket: { enabled: true, path: "/ws" },
    mcp: { enabled: true, prefix: "/mcp" },
  },
};

/**
 * Loads configuration from environment variables with validation
 */
function loadConfig(): EnhancedOmniServiceConfig {
  const envConfig: Partial<EnhancedOmniServiceConfig> = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    host: process.env.HOST,
    nodeEnv: process.env.NODE_ENV as "development" | "production" | "test",
    logLevel: process.env.LOG_LEVEL as "fatal" | "error" | "warn" | "info" | "debug" | "trace",
    trustProxy: process.env.TRUST_PROXY === "true",
    
    jwt: process.env.JWT_SECRET ? {
      secret: process.env.JWT_SECRET,
      algorithm: process.env.JWT_ALGORITHM as "HS256" | "RS256",
      expiresIn: process.env.JWT_EXPIRES,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES,
    } : undefined,
    
    // CORS configuration
    cors: process.env.CORS_ORIGIN ? {
      origin: process.env.CORS_ORIGIN.includes(",") 
        ? process.env.CORS_ORIGIN.split(",")
        : process.env.CORS_ORIGIN,
      credentials: process.env.CORS_CREDENTIALS === "true",
    } : undefined,
    
    // Rate limiting
    rateLimit: process.env.RATE_LIMIT_MAX ? {
      max: parseInt(process.env.RATE_LIMIT_MAX, 10),
      timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
    } : undefined,
    
    // RBAC configuration
    rbac: process.env.RBAC_DEFAULT_ROLES ? {
      defaultRoles: process.env.RBAC_DEFAULT_ROLES.split(","),
      permissionsCacheTTL: process.env.RBAC_PERMISSIONS_CACHE_TTL 
        ? parseInt(process.env.RBAC_PERMISSIONS_CACHE_TTL, 10)
        : undefined,
    } : undefined,
    
    // API key configuration
    apikey: process.env.APIKEY_ENABLED === "false" ? {
      enabled: false,
      headerName: process.env.APIKEY_HEADER_NAME,
      queryParam: process.env.APIKEY_QUERY_PARAM,
    } : {
      enabled: true,
      headerName: process.env.APIKEY_HEADER_NAME || "x-api-key",
      queryParam: process.env.APIKEY_QUERY_PARAM,
    },
    
    // Session configuration
    session: process.env.SESSION_ENABLED === "false" ? {
      enabled: false,
      cookieName: process.env.SESSION_COOKIE_NAME,
      cookieOptions: {
        httpOnly: process.env.SESSION_COOKIE_HTTPONLY !== "false",
        secure: process.env.SESSION_COOKIE_SECURE !== "false",
        sameSite: (process.env.SESSION_COOKIE_SAME_SITE as "strict" | "lax" | "none") || "strict",
        maxAge: process.env.SESSION_COOKIE_MAX_AGE 
          ? parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10)
          : undefined,
      },
    } : undefined,
  };

  const mergedConfig = { ...defaultConfig, ...envConfig };
  
  try {
    const validated = OmniServiceConfigSchema.parse(mergedConfig);
    
    // Validate JWT secret is present if not in test mode
    if (validated.jwt.secret && validated.nodeEnv !== "test") {
      if (validated.jwt.secret.length < 32) {
        throw new Error("JWT secret must be at least 32 characters long");
      }
    }
    
    return validated;
  } catch (error) {
    console.error("❌ Configuration validation failed:", error);
    process.exit(1);
  }
}

/**
 * Configuration object for the Omni Service
 */
export const config: EnhancedOmniServiceConfig = loadConfig();

// Export the schema for reuse in tests
export { OmniServiceConfigSchema };

/**
 * Configuration validation utilities
 */
export class ConfigValidator {
  /**
   * Validate JWT secret requirements
   */
  static validateJWTSecret(secret?: string, nodeEnv?: string): boolean {
    if (nodeEnv === "test") return true;
    if (!secret) return false;
    return secret.length >= 32;
  }
  
  /**
   * Validate adapter configuration
   */
  static validateAdapters(adapters: EnhancedOmniServiceConfig["adapters"]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check for conflicts in adapter endpoints
    const endpoints = new Set<string>();
    
    if (adapters.graphql.enabled) {
      const endpoint = adapters.graphql.endpoint;
      if (endpoints.has(endpoint)) {
        errors.push(`GraphQL endpoint conflicts with another adapter: ${endpoint}`);
      }
      endpoints.add(endpoint);
    }
    
    if (adapters.websocket.enabled) {
      const endpoint = adapters.websocket.path;
      if (endpoints.has(endpoint)) {
        errors.push(`WebSocket endpoint conflicts with another adapter: ${endpoint}`);
      }
      endpoints.add(endpoint);
    }
    
    // Validate MCP prefix doesn't conflict with REST prefix
    if (adapters.mcp.enabled && adapters.rest.enabled) {
      const mcpPrefix = adapters.mcp.prefix;
      const restPrefix = adapters.rest.prefix;
      
      if (mcpPrefix.startsWith(restPrefix) || restPrefix.startsWith(mcpPrefix)) {
        errors.push(`MCP prefix (${mcpPrefix}) conflicts with REST prefix (${restPrefix})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Validate rate limiting configuration
   */
  static validateRateLimiting(config: EnhancedOmniServiceConfig["rateLimit"]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!config) {
      return { valid: true, errors };
    }
    
    if (config.max <= 0) {
      errors.push("Rate limit max must be greater than 0");
    }
    
    // Parse time window to validate
    const timeWindowMatch = config.timeWindow.match(/^(\d+)(s|m|h|d)$/);
    if (!timeWindowMatch) {
      errors.push("Rate limit time window must be in format like '1m', '5m', '1h', '1d'");
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Validate session configuration
   */
  static validateSession(config: EnhancedOmniServiceConfig["session"]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!config) {
      return { valid: true, errors };
    }
    
    if (config.enabled && config.cookieOptions) {
      const { secure, sameSite } = config.cookieOptions;
      
      // In production, secure cookies should be enabled
      if (process.env.NODE_ENV === "production" && !secure) {
        errors.push("Session cookies should be secure in production");
      }
      
      // Validate sameSite value
      const validSameSite = ["strict", "lax", "none"];
      if (!validSameSite.includes(sameSite)) {
        errors.push(`Invalid sameSite value: ${sameSite}. Must be one of: ${validSameSite.join(", ")}`);
      }
      
      // Validate maxAge
      if (config.cookieOptions.maxAge <= 0) {
        errors.push("Session cookie maxAge must be greater than 0");
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Helper function to get configuration for a specific adapter
 */
export function getAdapterConfig<T extends keyof EnhancedOmniServiceConfig["adapters"]>(
  adapterName: T
): EnhancedOmniServiceConfig["adapters"][T] {
  return config.adapters[adapterName];
}

/**
 * Helper function to get authentication configuration
 */
export function getAuthConfig() {
  return {
    jwt: config.jwt,
    rbac: config.rbac,
    apikey: config.apikey,
    session: config.session,
  };
}