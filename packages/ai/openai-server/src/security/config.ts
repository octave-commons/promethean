import type { SecurityConfig } from "../types/security.js";

/**
 * Create security configuration from environment variables
 */
export function createSecurityConfig(): SecurityConfig {
  const jwtSecret = process.env.JWT_SECRET || "default-secret-change-in-production";
  const apiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(",").map(key => key.trim()) : [];
  
  if (jwtSecret === "default-secret-change-in-production") {
    console.warn("⚠️  Using default JWT secret. Please set JWT_SECRET environment variable in production.");
  }

  if (apiKeys.length === 0) {
    console.warn("⚠️  No API keys configured. Please set API_KEYS environment variable.");
  }

  return {
    auth: {
      jwtSecret,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
      refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
      apiKeys,
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
    },
    rateLimit: {
      global: {
        max: parseInt(process.env.RATE_LIMIT_GLOBAL || "1000", 10),
        window: process.env.RATE_LIMIT_GLOBAL_WINDOW || "1h",
      },
      user: {
        max: parseInt(process.env.RATE_LIMIT_USER || "100", 10),
        window: process.env.RATE_LIMIT_USER_WINDOW || "1h",
      },
      endpoint: {
        max: parseInt(process.env.RATE_LIMIT_ENDPOINT || "20", 10),
        window: process.env.RATE_LIMIT_ENDPOINT_WINDOW || "1m",
      },
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === "true",
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === "true",
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
        : ["http://localhost:3000", "http://localhost:3001"],
      credentials: process.env.CORS_CREDENTIALS !== "false",
    },
    headers: {
      enabled: process.env.SECURITY_HEADERS_ENABLED !== "false",
      contentSecurityPolicy: process.env.CONTENT_SECURITY_POLICY,
    },
    validation: {
      maxRequestSize: parseInt(process.env.MAX_REQUEST_SIZE || "1048576", 10), // 1MB
      allowedContentTypes: process.env.ALLOWED_CONTENT_TYPES
        ? process.env.ALLOWED_CONTENT_TYPES.split(",").map(type => type.trim())
        : ["application/json", "text/plain"],
    },
  };
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const errors: string[] = [];

  // Validate auth config
  if (!config.auth.jwtSecret || config.auth.jwtSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters long");
  }

  if (config.auth.apiKeys.length === 0) {
    errors.push("At least one API key must be configured");
  }

  if (config.auth.bcryptRounds < 10 || config.auth.bcryptRounds > 15) {
    errors.push("Bcrypt rounds should be between 10 and 15");
  }

  // Validate rate limit config
  if (config.rateLimit.global.max <= 0) {
    errors.push("Global rate limit must be positive");
  }

  if (config.rateLimit.user.max <= 0) {
    errors.push("User rate limit must be positive");
  }

  if (config.rateLimit.endpoint.max <= 0) {
    errors.push("Endpoint rate limit must be positive");
  }

  // Validate CORS config
  if (config.cors.origin.length === 0) {
    errors.push("At least one CORS origin must be allowed");
  }

  // Validate validation config
  if (config.validation.maxRequestSize <= 0) {
    errors.push("Max request size must be positive");
  }

  if (config.validation.allowedContentTypes.length === 0) {
    errors.push("At least one content type must be allowed");
  }

  return errors;
}

/**
 * Get security configuration with validation
 */
export function getValidatedSecurityConfig(): SecurityConfig {
  const config = createSecurityConfig();
  const errors = validateSecurityConfig(config);

  if (errors.length > 0) {
    throw new Error(`Invalid security configuration:\n${errors.join("\n")}`);
  }

  return config;
}