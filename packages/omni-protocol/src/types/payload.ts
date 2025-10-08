/**
 * @fileoverview Payload type definitions for Omni protocol
 */

/**
 * Base payload interface
 */
export interface OmniPayload {
  /** Payload version for compatibility */
  version?: string;

  /** Content type of the payload */
  contentType?: string;

  /** Actual payload data */
  data?: unknown;
}

/**
 * JSON payload type
 */
export interface OmniJsonPayload extends OmniPayload {
  contentType: "application/json";
  data: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

/**
 * Text payload type
 */
export interface OmniTextPayload extends OmniPayload {
  contentType: "text/plain";
  data: string;
}

/**
 * Binary payload type
 */
export interface OmniBinaryPayload extends OmniPayload {
  contentType: "application/octet-stream";
  data: ArrayBuffer | Uint8Array;
}

/**
 * Union type for all payload types
 */
export type OmniPayloadUnion =
  | OmniJsonPayload
  | OmniTextPayload
  | OmniBinaryPayload
  | OmniPayload;
