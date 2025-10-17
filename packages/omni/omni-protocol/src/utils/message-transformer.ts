/**
 * @fileoverview Transformation utilities for Omni messages
 */

import type {
  OmniMessageUnion,
  OmniRequest,
  OmniResponse,
  OmniEvent,
} from "../types/index.js";

/**
 * Transforms a message to JSON string
 */
export function messageToJson(message: OmniMessageUnion): string {
  return JSON.stringify(message, null, 2);
}

/**
 * Parses a JSON string to an Omni message
 */
export function messageFromJson(json: string): OmniMessageUnion {
  return JSON.parse(json);
}

/**
 * Clones an Omni message deeply
 */
export function cloneMessage<T extends OmniMessageUnion>(message: T): T {
  return JSON.parse(JSON.stringify(message));
}

/**
 * Merges headers into a message
 */
export function mergeHeaders<T extends OmniMessageUnion>(
  message: T,
  headers: NonNullable<T["headers"]>,
): T {
  return {
    ...message,
    headers: {
      ...message.headers,
      ...headers,
    },
  };
}

/**
 * Updates the timestamp of a message
 */
export function updateTimestamp<T extends OmniMessageUnion>(message: T): T {
  return {
    ...message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a response message from a request
 */
export function createResponseFromRequest(
  request: OmniRequest,
  success: boolean,
  data?: unknown,
  error?: { code: string; message: string; details?: Record<string, unknown> },
): OmniResponse {
  return {
    id: crypto.randomUUID(),
    type: "response",
    payload: {
      success,
      data,
      error,
    },
    headers: request.headers,
    timestamp: new Date().toISOString(),
    source: request.destination || "unknown",
    destination: request.source,
    correlationId: request.id,
  };
}

/**
 * Type guard to check if a message is a request
 */
export function isRequest(message: OmniMessageUnion): message is OmniRequest {
  return message.type === "request";
}

/**
 * Type guard to check if a message is a response
 */
export function isResponse(message: OmniMessageUnion): message is OmniResponse {
  return message.type === "response";
}

/**
 * Type guard to check if a message is an event
 */
export function isEvent(message: OmniMessageUnion): message is OmniEvent {
  return message.type === "event";
}

/**
 * Extracts correlation information from a message
 */
export function getCorrelationInfo(message: OmniMessageUnion): {
  id: string;
  correlationId?: string;
  isResponse: boolean;
  isRequest: boolean;
} {
  return {
    id: message.id,
    correlationId: message.correlationId,
    isResponse: isResponse(message),
    isRequest: isRequest(message),
  };
}
