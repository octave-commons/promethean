#!/usr/bin/env node
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_OUTPUT_FILE_NAME,
  generateEcosystem,
  type GenerateEcosystemOptions,
} from "../ecosystem.js";

const HELP_MESSAGE = `Usage: shadow-conf <command> [options]

Commands:
  ecosystem   Generate a PM2 ecosystem file from EDN sources.

Options for ecosystem:
  --input-dir <path>   Directory containing .edn definitions (default: cwd)
  --out <path>         Output directory for the generated file (default: cwd)
  --filename <name>    Name of the generated file (default: ${DEFAULT_OUTPUT_FILE_NAME})
`;

async function main(): Promise<void> {
  const [, , ...argv] = process.argv;
  const [command, ...rest] = argv;

  if (command === undefined || command === "--help" || command === "-h") {
    writeOut(HELP_MESSAGE);
    process.exit(command ? 0 : 1);
  }

  if (command !== "ecosystem") {
    writeError(`Unknown command: ${command}`);
    writeOut(HELP_MESSAGE);
    process.exit(1);
  }

  const options = parseOptions(rest);
  const result = await generateEcosystem(options);
  writeOut(`Wrote ${result.outputPath} (${result.apps.length} apps)`);
}

type Flag = "--input-dir" | "--out" | "--filename";

type ParsedOption = readonly [Flag, string];

type ParseState = {
  readonly options: readonly ParsedOption[];
  readonly skipNext: boolean;
};

function parseOptions(args: readonly string[]): GenerateEcosystemOptions {
  const recognizedFlags: readonly Flag[] = [
    "--input-dir",
    "--out",
    "--filename",
  ];

  const initialState: ParseState = { options: [], skipNext: false };

  const state = args.reduce<ParseState>((current, token, index, all) => {
    if (current.skipNext) {
      return { options: current.options, skipNext: false };
    }
    const [rawFlag, inline] = token.split("=", 2);
    if (!recognizedFlags.includes(rawFlag as Flag)) {
      throw new Error(`Unknown option: ${rawFlag}`);
    }
    const flag = rawFlag as Flag;
    if (inline !== undefined) {
      return {
        options: [...current.options, [flag, inline] as const],
        skipNext: false,
      };
    }
    const next = all[index + 1];
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`Missing value for option: ${flag}`);
    }
    return {
      options: [...current.options, [flag, next] as const],
      skipNext: true,
    };
  }, initialState);

  if (state.skipNext) {
    throw new Error("Missing value for option");
  }

  return state.options.reduce<GenerateEcosystemOptions>(
    (accumulator, [flag, value]) => {
      if (flag === "--input-dir") {
        return { ...accumulator, inputDir: path.resolve(value) };
      }
      if (flag === "--out") {
        return { ...accumulator, outputDir: path.resolve(value) };
      }
      if (flag === "--filename") {
        return { ...accumulator, fileName: value };
      }
      return accumulator;
    },
    {},
  );
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

undefinedVariable;