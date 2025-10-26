/**
 * @fileoverview Core message type definitions for Omni protocol
 */

import { OmniPayload } from "./payload.js";
import { OmniHeaders } from "./headers.js";

/**
 * Base message interface for all Omni protocol communications
 */
export interface OmniMessage {
  /** Unique identifier for the message */
  id: string;

  /** Message type determining routing and handling */
  type: string;

  /** Message payload containing the actual data */
  payload: OmniPayload;

  /** Optional metadata headers */
  headers?: OmniHeaders;

  /** Timestamp when the message was created */
  timestamp: string;

  /** Source of the message (service, agent, etc.) */
  source: string;

  /** Destination for the message (optional for broadcasts) */
  destination?: string;

  /** Message correlation ID for tracking request/response pairs */
  correlationId?: string;
}

/**
 * Request message type
 */
export interface OmniRequest extends OmniMessage {
  type: "request";
  payload: OmniPayload & {
    /** The action or method to invoke */
    action: string;
    /** Parameters for the action */
    params?: Record<string, unknown>;
  };
}

/**
 * Response message type
 */
export interface OmniResponse extends OmniMessage {
  type: "response";
  payload: OmniPayload & {
    /** Whether the request was successful */
    success: boolean;
    /** Response data or error information */
    data?: unknown;
    /** Error details if success is false */
    error?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };

  /** Correlation ID is required for responses */
  correlationId: string;
}

/**
 * Event message type for asynchronous notifications
 */
export interface OmniEvent extends OmniMessage {
  type: "event";
  payload: OmniPayload & {
    /** Event name or type */
    event: string;
    /** Event data */
    data?: unknown;
  };
}

/**
 * Union type for all Omni message types
 */
export type OmniMessageUnion = OmniRequest | OmniResponse | OmniEvent;
