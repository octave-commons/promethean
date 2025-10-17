/**
 * @fileoverview Builder utilities for creating Omni messages
 */

import type {
  OmniRequest,
  OmniResponse,
  OmniEvent,
  OmniHeaders,
} from "../types/index.js";
import { randomUUID } from "node:crypto";

/**
 * Builder class for creating Omni messages
 */
export class OmniMessageBuilder {
  private id: string = randomUUID();
  private payload: any = {};
  private headers: OmniHeaders = {};
  private timestamp: string = new Date().toISOString();
  private source: string = "";
  private destination?: string;
  private correlationId?: string;

  /**
   * Set the message ID
   */
  setId(id: string): this {
    this.id = id;
    return this;
  }

  /**
   * Set the payload
   */
  setPayload(payload: any): this {
    this.payload = payload;
    return this;
  }

  /**
   * Set the headers
   */
  setHeaders(headers: OmniHeaders): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Set a single header
   */
  setHeader(key: keyof NonNullable<OmniHeaders>, value: any): this {
    if (!this.headers) {
      this.headers = {};
    }
    this.headers[key] = value;
    return this;
  }

  /**
   * Set the source
   */
  setSource(source: string): this {
    this.source = source;
    return this;
  }

  /**
   * Set the destination
   */
  setDestination(destination: string): this {
    this.destination = destination;
    return this;
  }

  /**
   * Set the correlation ID
   */
  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    return this;
  }

  /**
   * Build a request message
   */
  buildRequest(action: string, params?: Record<string, unknown>): OmniRequest {
    return {
      id: this.id,
      type: "request",
      payload: {
        ...this.payload,
        action,
        params,
      },
      headers: this.headers,
      timestamp: this.timestamp,
      source: this.source,
      destination: this.destination,
      correlationId: this.correlationId,
    };
  }

  /**
   * Build a response message
   */
  buildResponse(
    correlationId: string,
    success: boolean,
    data?: unknown,
    error?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    },
  ): OmniResponse {
    return {
      id: this.id,
      type: "response",
      payload: {
        ...this.payload,
        success,
        data,
        error,
      },
      headers: this.headers,
      timestamp: this.timestamp,
      source: this.source,
      destination: this.destination,
      correlationId,
    };
  }

  /**
   * Build an event message
   */
  buildEvent(event: string, data?: unknown): OmniEvent {
    return {
      id: this.id,
      type: "event",
      payload: {
        ...this.payload,
        event,
        data,
      },
      headers: this.headers,
      timestamp: this.timestamp,
      source: this.source,
      destination: this.destination,
      correlationId: this.correlationId,
    };
  }
}

/**
 * Convenience function to create a new message builder
 */
export function createOmniMessage(): OmniMessageBuilder {
  return new OmniMessageBuilder();
}

/**
 * Quick function to create a request message
 */
export function createOmniRequest(
  source: string,
  action: string,
  params?: Record<string, unknown>,
  options?: {
    destination?: string;
    headers?: OmniHeaders;
    correlationId?: string;
  },
): OmniRequest {
  const builder = new OmniMessageBuilder()
    .setSource(source)
    .setPayload({ action, params });

  if (options?.headers) {
    builder.setHeaders(options.headers);
  }
  if (options?.destination) {
    builder.setDestination(options.destination);
  }
  if (options?.correlationId) {
    builder.setCorrelationId(options.correlationId);
  }

  return builder.buildRequest(action, params);
}

/**
 * Quick function to create a response message
 */
export function createOmniResponse(
  source: string,
  correlationId: string,
  success: boolean,
  data?: unknown,
  error?: { code: string; message: string; details?: Record<string, unknown> },
  options?: {
    destination?: string;
    headers?: OmniHeaders;
  },
): OmniResponse {
  const builder = new OmniMessageBuilder().setSource(source);

  if (options?.headers) {
    builder.setHeaders(options.headers);
  }
  if (options?.destination) {
    builder.setDestination(options.destination);
  }

  return builder.buildResponse(correlationId, success, data, error);
}

/**
 * Quick function to create an event message
 */
export function createOmniEvent(
  source: string,
  event: string,
  data?: unknown,
  options?: {
    destination?: string;
    headers?: OmniHeaders;
    correlationId?: string;
  },
): OmniEvent {
  const builder = new OmniMessageBuilder().setSource(source);

  if (options?.headers) {
    builder.setHeaders(options.headers);
  }
  if (options?.destination) {
    builder.setDestination(options.destination);
  }
  if (options?.correlationId) {
    builder.setCorrelationId(options.correlationId);
  }

  return builder.buildEvent(event, data);
}
