/**
 * @fileoverview Factory functions for creating Omni protocol errors
 */

import type {
  OmniError,
  OmniValidationError,
  OmniTimeoutError,
  OmniAuthError,
  OmniRoutingError,
} from "../types/index.js";

/**
 * Creates a generic Omni error
 */
export function createOmniError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): OmniError {
  const error: OmniError = {
    code,
    message,
    details,
  };

  if (process.env.NODE_ENV !== "production") {
    error.stack = new Error().stack;
  }

  return error;
}

/**
 * Creates a validation error
 */
export function createValidationError(
  message: string,
  path?: string,
  expected?: string,
  received?: unknown,
): OmniValidationError {
  return {
    code: "VALIDATION_ERROR",
    message,
    path,
    expected,
    received,
    ...(process.env.NODE_ENV !== "production" && { stack: new Error().stack }),
  };
}

/**
 * Creates a timeout error
 */
export function createTimeoutError(
  timeout: number,
  operation?: string,
): OmniTimeoutError {
  return {
    code: "TIMEOUT_ERROR",
    message: `Operation${operation ? ` '${operation}'` : ""} timed out after ${timeout}ms`,
    timeout,
    operation,
    ...(process.env.NODE_ENV !== "production" && { stack: new Error().stack }),
  };
}

/**
 * Creates an authentication error
 */
export function createAuthError(
  authType: "missing" | "invalid" | "expired" | "insufficient",
  message?: string,
): OmniAuthError {
  return {
    code: "AUTH_ERROR",
    message: message || `Authentication error: ${authType}`,
    authType,
    ...(process.env.NODE_ENV !== "production" && { stack: new Error().stack }),
  };
}

/**
 * Creates a routing error
 */
export function createRoutingError(
  reason:
    | "unknown_destination"
    | "unreachable"
    | "queue_full"
    | "permission_denied",
  destination?: string,
): OmniRoutingError {
  return {
    code: "ROUTING_ERROR",
    message: `Routing error: ${reason}${destination ? ` for destination '${destination}'` : ""}`,
    destination,
    reason,
    ...(process.env.NODE_ENV !== "production" && { stack: new Error().stack }),
  };
}

/**
 * Creates an error from a JavaScript Error object
 */
export function errorFromJsError(
  error: Error,
  defaultCode: string = "UNKNOWN_ERROR",
): OmniError {
  return {
    code: defaultCode,
    message: error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  };
}

/**
 * Checks if an error is an Omni protocol error
 */
export function isOmniProtocolError(error: unknown): error is OmniError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

/**
 * Extracts error information for logging
 */
export function extractErrorInfo(error: OmniError): {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  hasStack: boolean;
} {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    hasStack: !!error.stack,
  };
}
