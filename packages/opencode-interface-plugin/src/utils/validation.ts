// SPDX-License-Identifier: GPL-3.0-only

/**
 * Validation utilities for plugin inputs
 */

export const validate = {
  /**
   * Validate a string parameter
   */
  string: (value: unknown, paramName: string): string => {
    if (typeof value !== 'string') {
      throw new Error(`Parameter '${paramName}' must be a string, received ${typeof value}`);
    }
    return value;
  },

  /**
   * Validate an optional string parameter
   */
  optionalString: (value: unknown, paramName: string): string | undefined => {
    if (value === undefined || value === null) {
      return undefined;
    }
    return validate.string(value, paramName);
  },

  /**
   * Validate a number parameter
   */
  number: (value: unknown, paramName: string): number => {
    if (typeof value !== 'number') {
      throw new Error(`Parameter '${paramName}' must be a number, received ${typeof value}`);
    }
    return value;
  },

  /**
   * Validate an optional number parameter with default
   */
  optionalNumber: (
    value: unknown,
    paramName: string,
    defaultValue?: number,
  ): number | undefined => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return validate.number(value, paramName);
  },

  /**
   * Validate a boolean parameter
   */
  boolean: (value: unknown, paramName: string): boolean => {
    if (typeof value !== 'boolean') {
      throw new Error(`Parameter '${paramName}' must be a boolean, received ${typeof value}`);
    }
    return value;
  },

  /**
   * Validate an optional boolean parameter with default
   */
  optionalBoolean: (value: unknown, paramName: string, defaultValue: boolean): boolean => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return validate.boolean(value, paramName);
  },

  /**
   * Validate a session ID format
   */
  sessionId: (value: unknown): string => {
    const sessionId = validate.optionalString(value, 'sessionId');
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    if (sessionId.length === 0) {
      throw new Error('Session ID cannot be empty');
    }
    return sessionId;
  },

  /**
   * Validate search query
   */
  searchQuery: (value: unknown): string => {
    const query = validate.optionalString(value, 'query');
    if (query && query.length === 0) {
      throw new Error('Search query cannot be empty');
    }
    return query || '';
  },

  /**
   * Validate limit parameter with reasonable bounds
   */
  limit: (value: unknown, defaultLimit = 20): number => {
    const limit = validate.optionalNumber(value, 'limit', defaultLimit);
    if (limit <= 0) {
      throw new Error('Limit must be greater than 0');
    }
    if (limit > 1000) {
      throw new Error('Limit cannot exceed 1000');
    }
    return limit;
  },
};
