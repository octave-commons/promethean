/**
 * Schemas Module - Shared Type Definitions and Schemas
 */

// Schema definitions will be added here
export const SCHEMAS_VERSION = '1.0.0';

// Common schema types
export interface BaseSchema {
  id: string;
  type: string;
  version: string;
  created: Date;
  updated: Date;
}

export interface ConfigSchema extends BaseSchema {
  name: string;
  description: string;
  properties: Record<string, any>;
}

// Export types for use in tests
export type { BaseSchema, ConfigSchema };
