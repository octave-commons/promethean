/**
 * Shared Module - Common Types and Utilities
 */

// Shared types and utilities will be added here
export const SHARED_VERSION = '1.0.0';

// Common interfaces
export interface BaseConfig {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
}

export const defaultLoggerConfig: LoggerConfig = {
  level: 'info',
  format: 'text',
};
