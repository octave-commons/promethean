/**
 * @fileoverview Validation utilities for Omni protocol
 */

import type {
  OmniMessageUnion,
  OmniProtocolError,
  OmniHeaders,
} from "../types/index.js";
import {
  OmniMessageUnionSchema,
  OmniHeadersSchema,
  OmniProtocolErrorSchema,
} from "./schemas.js";
import { z } from "zod";

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Validates an Omni message against the schema
 */
export function validateOmniMessage(
  message: unknown,
): ValidationResult<OmniMessageUnion> {
  const result = OmniMessageUnionSchema.safeParse(message);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Validates Omni headers
 */
export function validateOmniHeaders(
  headers: unknown,
): ValidationResult<OmniHeaders> {
  const result = OmniHeadersSchema.safeParse(headers);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Validates an Omni protocol error
 */
export function validateOmniError(
  error: unknown,
): ValidationResult<OmniProtocolError> {
  const result = OmniProtocolErrorSchema.safeParse(error);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Type guard to check if a value is a valid Omni message
 */
export function isOmniMessage(value: unknown): value is OmniMessageUnion {
  const result = validateOmniMessage(value);
  return result.success;
}

/**
 * Type guard to check if a value is valid Omni headers
 */
export function isOmniHeaders(value: unknown): value is OmniHeaders {
  const result = validateOmniHeaders(value);
  return result.success;
}

/**
 * Type guard to check if a value is a valid Omni error
 */
export function isOmniError(value: unknown): value is OmniProtocolError {
  const result = validateOmniError(value);
  return result.success;
}

/**
 * Asserts that a value is a valid Omni message, throws if not
 */
export function assertOmniMessage(
  value: unknown,
): asserts value is OmniMessageUnion {
  const result = validateOmniMessage(value);
  if (!result.success) {
    throw new Error(`Invalid Omni message: ${result.error.message}`);
  }
}

/**
 * Asserts that a value is valid Omni headers, throws if not
 */
export function assertOmniHeaders(
  value: unknown,
): asserts value is OmniHeaders {
  const result = validateOmniHeaders(value);
  if (!result.success) {
    throw new Error(`Invalid Omni headers: ${result.error.message}`);
  }
}

/**
 * Asserts that a value is a valid Omni error, throws if not
 */
export function assertOmniError(
  value: unknown,
): asserts value is OmniProtocolError {
  const result = validateOmniError(value);
  if (!result.success) {
    throw new Error(`Invalid Omni error: ${result.error.message}`);
  }
}
