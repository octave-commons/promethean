import { resolve } from 'path';
import { existsSync } from 'fs';

import { z } from 'zod';

/**
 * Validates API key format to ensure it contains only valid characters
 */
const apiKeyValidator = z
  .string()
  .optional()
  .refine(
    (key) => {
      if (!key) return true; // Optional field
      // Allow alphanumeric, hyphens, underscores, and periods (common API key formats)
      return /^[a-zA-Z0-9\-_\.]+$/.test(key);
    },
    {
      message: 'API key contains invalid characters',
    },
  );

/**
 * Validates path to prevent directory traversal attacks
 */
const pathValidator = z
  .string()
  .default(process.cwd())
  .refine(
    (path) => {
      try {
        const resolved = resolve(path);
        const cwd = process.cwd();
        // Allow the current working directory and its subdirectories
        // Also allow absolute paths that exist
        return resolved.startsWith(cwd) || existsSync(resolved);
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid path: path must exist or be within current working directory',
    },
  );

export const ConfigSchema = z.object({
  path: pathValidator,
  debounceMs: z.coerce.number().int().positive().min(1000).max(300000).default(10_000),
  baseUrl: z
    .string()
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'baseUrl must be a valid HTTP or HTTPS URL' },
    )
    .default(process.env.OPENAI_BASE_URL ?? 'http://localhost:11434/v1'),
  apiKey: apiKeyValidator,
  model: z
    .string()
    .min(1)
    .default(process.env.AUTOCOMMIT_MODEL ?? 'llama3.1:8b'),
  temperature: z.coerce.number().min(0).max(2).default(0.2),
  maxDiffBytes: z.coerce.number().int().positive().min(1000).max(100000).default(20_000),
  exclude: z.string().default(process.env.AUTOCOMMIT_EXCLUDE ?? ''),
  signoff: z
    .any()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true' || val === '1';
      return Boolean(val);
    })
    .default(process.env.AUTOCOMMIT_SIGNOFF === '1'),
  dryRun: z
    .any()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true' || val === '1';
      return Boolean(val);
    })
    .default(process.env.DRY_RUN === '1'),
});

export type Config = z.infer<typeof ConfigSchema>;
