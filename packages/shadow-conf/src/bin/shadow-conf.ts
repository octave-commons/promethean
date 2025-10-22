#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';

import {
  DEFAULT_OUTPUT_FILE_NAME,
  generateEcosystem,
  type GenerateEcosystemOptions,
} from '../ecosystem.js';
import {
  validateAndSanitizePath,
  validateAndSanitizeFilename,
  DEFAULT_SECURITY_CONFIG,
} from '../security-utils.js';

const HELP_MESSAGE = `Usage: shadow-conf <command> [options]

Commands:
  ecosystem   Generate a PM2 ecosystem file from EDN sources.

Options for ecosystem:
  --input-dir <path>   Directory containing .edn definitions (default: cwd)
  --out <path>         Output directory for generated file (default: cwd)
  --filename <name>    Name of generated file (default: ${DEFAULT_OUTPUT_FILE_NAME})
`;

/**
 * Main CLI entry point for shadow-conf.
 *
 * Parses command line arguments and executes the appropriate command.
 * Currently supports only the 'ecosystem' command for generating PM2 configurations.
 *
 * @throws {Error} When invalid arguments are provided
 * @throws {Error} When command execution fails
 */
async function main(): Promise<void> {
  const [, , ...argv] = process.argv;
  const [command, ...rest] = argv;

  if (command === undefined || command === '--help' || command === '-h') {
    writeOut(HELP_MESSAGE);
    process.exit(command ? 0 : 1);
  }

  if (command !== 'ecosystem') {
    writeError(`Unknown command: ${command}`);
    writeOut(HELP_MESSAGE);
    process.exit(1);
  }

  const options = parseOptions(rest);
  const result = await generateEcosystem(options);
  writeOut(`Wrote ${result.outputPath} (${result.apps.length} apps)`);
}

type Flag = '--input-dir' | '--out' | '--filename';

type ParsedOption = readonly [Flag, string];

type ParseState = {
  readonly options: readonly ParsedOption[];
  readonly skipNext: boolean;
};

function validateFlag(flag: string): Flag {
  const recognizedFlags: readonly Flag[] = ['--input-dir', '--out', '--filename'];

  if (!recognizedFlags.includes(flag as Flag)) {
    throw new Error(`Unknown option: ${flag}`);
  }

  return flag as Flag;
}

function parseFlagValue(token: string, index: number, all: readonly string[]): [Flag, string] {
  const parts = token.split('=', 2);
  const rawFlag = parts[0]!;
  const inline = parts[1];
  const flag = validateFlag(rawFlag);

  if (inline !== undefined) {
    return [flag, inline];
  }

  const next = all[index + 1]!;
  if (next === undefined || next.startsWith('--')) {
    throw new Error(`Missing value for option: ${flag}`);
  }

  return [flag, next];
}

/**
 * Validates user input for security and safety using centralized security utilities.
 *
 * @param input - The user input to validate
 * @param type - The type of input being validated
 * @throws {Error} When input is malicious or invalid
 */
function validateUserInput(input: string, type: 'path' | 'filename'): void {
  if (type === 'filename') {
    const result = validateAndSanitizeFilename(input, DEFAULT_SECURITY_CONFIG);
    if (!result.success) {
      throw new Error(result.error);
    }
  } else {
    const result = validateAndSanitizePath(input, 'CLI argument', DEFAULT_SECURITY_CONFIG);
    if (!result.success) {
      throw new Error(result.error);
    }
  }
}

function convertToOptions(flagPairs: readonly ParsedOption[]): GenerateEcosystemOptions {
  return flagPairs.reduce<GenerateEcosystemOptions>((accumulator, [flag, value]) => {
    if (flag === '--input-dir') {
      validateUserInput(value, 'path');
      const resolvedPath = path.resolve(value);
      return { ...accumulator, inputDir: resolvedPath };
    }
    if (flag === '--out') {
      validateUserInput(value, 'path');
      const resolvedPath = path.resolve(value);
      return { ...accumulator, outputDir: resolvedPath };
    }
    if (flag === '--filename') {
      validateUserInput(value, 'filename');
      return { ...accumulator, fileName: value };
    }
    return accumulator;
  }, {});
}

/**
 * Parses command line options for the ecosystem command with security validation.
 *
 * Supports both space-separated and equals notation for options:
 * - `--input-dir ./config` (space-separated)
 * - `--input-dir=./config` (equals notation)
 *
 * @param args - Command line arguments (excluding command name)
 * @returns Parsed options object
 *
 * @throws {Error} When unknown options are encountered
 * @throws {Error} When option values are missing
 * @throws {Error} When option values contain malicious content
 *
 * @example
 * ```typescript
 * parseOptions(['--input-dir', './config', '--filename', 'ecosystem.mjs']);
 * // Returns: { inputDir: '/absolute/path/to/config', fileName: 'ecosystem.mjs' }
 * ```
 */
function parseOptions(args: readonly string[]): GenerateEcosystemOptions {
  const initialState: ParseState = { options: [], skipNext: false };

  const state = args.reduce<ParseState>((current, token, index, all) => {
    if (current.skipNext) {
      return { options: current.options, skipNext: false };
    }

    const [flag, value] = parseFlagValue(token, index, all);
    const hasInlineValue = token.includes('=');

    return {
      options: [...current.options, [flag, value] as const],
      skipNext: !hasInlineValue,
    };
  }, initialState);

  if (state.skipNext) {
    throw new Error('Missing value for option');
  }

  return convertToOptions(state.options);
}

function writeOut(message: string): void {
  process.stdout.write(`${message}\n`);
}

function writeError(message: string): void {
  process.stderr.write(`${message}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  writeError(message);
  process.exit(1);
});
