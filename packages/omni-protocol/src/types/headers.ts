/**
 * @fileoverview Header type definitions for Omni protocol
 */

/**
 * Standard headers for Omni messages
 */
export type OmniHeaders =
  | {
      /** Authentication token */
      authorization?: string;

      /** Message priority */
      priority?: "low" | "normal" | "high" | "critical";

      /** Request timeout in milliseconds */
      timeout?: number;

      /** Retry count */
      retryCount?: number;

      /** Message routing information */
      routing?: {
        /** Routing key pattern */
        key?: string;
        /** Exchange name */
        exchange?: string;
      };

      /** Custom metadata */
      metadata?: Record<string, string | number | boolean>;

      /** Content encoding */
      contentEncoding?: string;

      /** Message expiration time */
      expiresAt?: string;
    }
  | undefined;
