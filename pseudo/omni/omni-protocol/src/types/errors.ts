/**
 * @fileoverview Error type definitions for Omni protocol
 */

/**
 * Base Omni protocol error
 */
export interface OmniError {
  /** Error code */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Detailed error information */
  details?: Record<string, unknown>;

  /** Stack trace for debugging */
  stack?: string;
}

/**
 * Validation error for malformed messages
 */
export interface OmniValidationError extends OmniError {
  code: "VALIDATION_ERROR";

  /** Path to the invalid field */
  path?: string;

  /** Expected value or type */
  expected?: string;

  /** Actual value received */
  received?: unknown;
}

/**
 * Timeout error for operations that exceed time limits
 */
export interface OmniTimeoutError extends OmniError {
  code: "TIMEOUT_ERROR";

  /** Timeout duration in milliseconds */
  timeout: number;

  /** Operation that timed out */
  operation?: string;
}

/**
 * Authentication/authorization error
 */
export interface OmniAuthError extends OmniError {
  code: "AUTH_ERROR";

  /** Type of authentication failure */
  authType: "missing" | "invalid" | "expired" | "insufficient";
}

/**
 * Routing error for message delivery failures
 */
export interface OmniRoutingError extends OmniError {
  code: "ROUTING_ERROR";

  /** Destination that failed */
  destination?: string;

  /** Reason for routing failure */
  reason:
    | "unknown_destination"
    | "unreachable"
    | "queue_full"
    | "permission_denied";
}

/**
 * Union type for all Omni protocol errors
 */
export type OmniProtocolError =
  | OmniValidationError
  | OmniTimeoutError
  | OmniAuthError
  | OmniRoutingError
  | OmniError;
