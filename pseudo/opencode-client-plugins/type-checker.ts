// SPDX-License-Identifier: GPL-3.0-only
// Type Checker Plugin - provides automatic type checking for written files

import type { Plugin } from '@opencode-ai/plugin';

// Language checker configurations
interface CheckerConfig {
  command: string;
  args: string[];
  parseOutput: (output: string) => { errors: string[]; warnings: string[] };
}

// Language pattern interface
interface LanguagePattern {
  extensions: string[];
  specialFiles?: string[];
  config: CheckerConfig;
}

// File type patterns for different languages
const LANGUAGE_PATTERNS: Record<string, LanguagePattern> = {
  typescript: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    config: {
      command: 'pnpm',
      args: ['tsc', '--noEmit', '--skipLibCheck'],
      parseOutput: (output: string) => {
        const lines = output.split('\n');
        const errors: string[] = [];
        const warnings: string[] = [];

        lines.forEach((line) => {
          if (line.includes('error') || line.match(/^\d+:\d+/)) {
            errors.push(line);
          } else if (line.includes('warning')) {
            warnings.push(line);
          }
        });

        return { errors, warnings };
      },
    },
  },
  clojure: {
    extensions: ['.clj', '.cljs', '.cljc', '.edn'],
    specialFiles: ['shadow-cljs.edn', 'deps.edn'],
    config: {
      command: 'clj-kondo',
      args: ['--lint'],
      parseOutput: (output: string) => {
        const lines = output.split('\n');
        const errors: string[] = [];
        const warnings: string[] = [];

        lines.forEach((line) => {
          if (line.includes('error') || line.includes('✗')) {
            errors.push(line);
          } else if (line.includes('warning') || line.includes('⚠')) {
            warnings.push(line);
          }
        });

        return { errors, warnings };
      },
    },
  },
  babashka: {
    extensions: ['.bb'],
    specialFiles: ['bb.edn'],
    config: {
      command: 'bb',
      args: ['--check'],
      parseOutput: (output: string) => {
        const lines = output.split('\n');
        const errors: string[] = [];
        const warnings: string[] = [];

        lines.forEach((line) => {
          if (line.includes('error') || line.includes('Exception')) {
            errors.push(line);
          } else if (line.includes('warning')) {
            warnings.push(line);
          }
        });

        return { errors, warnings };
      },
    },
  },
};

// Simplified file type detection
function detectLanguage(filePath: string): string | null {
  const fileName = filePath.split('/').pop() || '';

  for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.extensions.some((ext) => filePath.endsWith(ext))) {
      return language;
    }

    if (pattern.specialFiles?.includes(fileName)) {
      return language;
    }
  }

  return null;
}

// Simplified type checker execution
async function runTypeChecker(
  filePath: string,
  config: CheckerConfig,
  $: any,
): Promise<{
  success: boolean;
  output: string;
  errors: string[];
  warnings: string[];
}> {
  try {
    const result = await $`${config.command} ${[...config.args, filePath].join(' ')}`.text();
    const { errors, warnings } = config.parseOutput(result);

    return {
      success: errors.length === 0,
      output: result,
      errors,
      warnings,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stderr || error.stdout || error.message || 'Unknown error',
      errors: [error.message || 'Type checker failed'],
      warnings: [],
    };
  }
}

// Metadata helper
function addTypeCheckMetadata(output: any, result: any): void {
  const baseMetadata = output.metadata || {};

  if (result.success) {
    output.metadata = {
      ...baseMetadata,
      typeCheckSuccess: true,
      typeCheckWarnings: result.warnings,
    };
  } else {
    output.metadata = {
      ...baseMetadata,
      typeCheckSuccess: false,
      typeCheckErrors: result.errors,
      typeCheckWarnings: result.warnings,
      typeCheckOutput: result.output,
    };
  }
}

/**
 * Type Checker Plugin
 *
 * Provides automatic type checking for written files including:
 * - TypeScript/JavaScript checking with tsc
 * - Clojure checking with clj-kondo
 * - Babashka checking with bb
 * - Automatic language detection
 * - Metadata enrichment with type check results
 */
export const TypeCheckerPlugin: Plugin = async ({ $ }) => {
  console.log('🔍 Type Checker Plugin initialized - automatic type checking enabled');

  return {
    'tool.execute.after': async (input: any, output: any) => {
      // Only run type checking after write operations
      if (input.tool === 'write') {
        const filePath = (output as any).args?.filePath;

        if (!filePath) {
          return;
        }

        // Detect language and get checker config
        const language = detectLanguage(filePath);
        if (!language) {
          return;
        }

        const config = LANGUAGE_PATTERNS[language]?.config;
        if (!config) {
          return;
        }

        console.log(`Running ${language} type checking for ${filePath}...`);

        try {
          const result = await runTypeChecker(filePath, config, $);

          if (!result.success) {
            console.error(`Type errors found in ${filePath}:`);
            console.error(result.output);
          } else {
            console.log(`✅ No type errors in ${filePath}`);
          }

          addTypeCheckMetadata(output, result);
        } catch (error) {
          console.error(`Failed to run type checker on ${filePath}:`, error);
          addTypeCheckMetadata(output, {
            success: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            warnings: [],
          });
        }
      }
    },
  };
};
