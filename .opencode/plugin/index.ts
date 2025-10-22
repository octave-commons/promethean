export { OpencodeInterfacePlugin } from '@promethean/opencode-client/plugins';
import { resolve, relative } from 'node:path';

type DirectoryState = {
  virtualDirectory: string;
  lastReminder: number;
};

const directoryStateMap = new Map<string, DirectoryState>();
const REMINDER_INTERVAL = 5 * 60 * 1000;

function getDirectoryState(sessionID: string, projectDirectory: string): DirectoryState {
  const existing = directoryStateMap.get(sessionID);
  if (existing) return existing;

  const state: DirectoryState = {
    virtualDirectory: projectDirectory,
    lastReminder: Date.now(),
  };
  directoryStateMap.set(sessionID, state);
  return state;
}

function resolveVirtualDirectory(currentDir: string, target: string, projectRoot: string): string {
  const resolved = resolve(currentDir, target);
  const relativePath = relative(projectRoot, resolved);

  if (relativePath.startsWith('..') || resolve(projectRoot, relativePath) !== resolved) {
    return projectRoot;
  }

  return resolved;
}

function parseCDCommand(command: string): string | null {
  const trimmed = command.trim();
  const cdMatch = trimmed.match(/^(?:cd|chdir)\s+(.+?)(?:\s*&&|\s*;|\s*$)/);
  if (!cdMatch) return null;

  const pathArg = cdMatch[1].trim();

  if (
    (pathArg.startsWith('"') && pathArg.endsWith('"')) ||
    (pathArg.startsWith("'") && pathArg.endsWith("'"))
  ) {
    return pathArg.slice(1, -1);
  }

  return pathArg;
}

function extractBashCommand(command: string): string {
  const parts = command.split(/&&|;/);
  return parts[0].trim();
}

function shouldShowReminder(state: DirectoryState): boolean {
  const now = Date.now();
  return now - state.lastReminder > REMINDER_INTERVAL;
}

function formatDirectoryPath(projectDirectory: string, virtualDirectory: string): string {
  const relativePath = relative(projectDirectory, virtualDirectory);
  return relativePath === '' ? '.' : relativePath;
}

function handleCDCommand(
  command: string,
  state: DirectoryState,
  projectDirectory: string,
  sessionID: string,
): string {
  const bashCommand = extractBashCommand(command);
  const cdTarget = parseCDCommand(bashCommand);

  if (cdTarget !== null) {
    const newVirtualDir = resolveVirtualDirectory(
      state.virtualDirectory,
      cdTarget,
      projectDirectory,
    );
    const newState = { ...state, virtualDirectory: newVirtualDir };
    directoryStateMap.set(sessionID, newState);

    const remainingCommand = command.replace(bashCommand, '').trim();
    return remainingCommand;
  }

  return command;
}

export const DirectoryAwarenessPlugin: Plugin = async (ctx) => {
  const projectDirectory = ctx.directory;

  return {
    tool: {
      pwd: tool({
        description: 'Show current virtual working directory',
        args: {},
        async execute(_args, context) {
          const state = getDirectoryState(context.sessionID, projectDirectory);
          const displayPath = formatDirectoryPath(projectDirectory, state.virtualDirectory);
          return `Current virtual directory: ${displayPath} (${state.virtualDirectory})`;
        },
      }),
    },

    async 'tool.execute.before'(input, output) {
      if (input.tool !== 'bash') return;

      const state = getDirectoryState(input.sessionID, projectDirectory);
      const args = output.args as Record<string, unknown>;
      const command = (args.command as string) || '';

      const updatedCommand = handleCDCommand(command, state, projectDirectory, input.sessionID);
      if (updatedCommand !== command) {
        args.command = updatedCommand;
      }

      args.cwd = state.virtualDirectory;
    },

    async 'tool.execute.after'(input, output) {
      if (input.tool !== 'bash') return;

      const state = getDirectoryState(input.sessionID, projectDirectory);

      if (shouldShowReminder(state)) {
        const displayPath = formatDirectoryPath(projectDirectory, state.virtualDirectory);
        output.output += `\n\n💡 Directory Reminder: You are in virtual directory "${displayPath}"`;
        const updatedState = { ...state, lastReminder: Date.now() };
        directoryStateMap.set(input.sessionID, updatedState);
      }
    },
  };
};

function findBracePattern(input: string): Readonly<RegExpMatchArray> | null {
  const bracePattern = /{([^{}]+)}/;
  return input.match(bracePattern);
}

function hasComma(content: string): boolean {
  return content.includes(',');
}

function splitAlternatives(content: string): readonly string[] {
  return content.split(',').map((alt) => alt.trim());
}

function expandSingleBrace(input: string, fullMatch: string, content: string): readonly string[] {
  if (!hasComma(content)) {
    return [input.replace(fullMatch, content)];
  }

  const alternatives = splitAlternatives(content);
  return alternatives.map((alt) => input.replace(fullMatch, alt));
}

function expandBraces(input: string): readonly string[] {
  const match = findBracePattern(input);

  if (!match) {
    return [input];
  }

  const fullMatch = match[0];
  const content = match[1];
  const expanded = expandSingleBrace(input, fullMatch, content);

  if (expanded.length === 1 && expanded[0] === input) {
    return [input];
  }

  const furtherExpanded = expanded.flatMap((item) => expandBraces(item));
  return [...new Set(furtherExpanded)];
}

function isMkdirCommand(command: string): boolean {
  const trimmed = command.trim();
  return trimmed.startsWith('mkdir ') || trimmed.startsWith('mkdir -p ');
}

function extractMkdirPath(command: string): string | null {
  const trimmed = command.trim();
  const match = trimmed.match(/^mkdir\s+(?:-p\s+)?(.+)$/);
  return match ? match[1].trim() : null;
}

function transformMkdirCommand(command: string): string {
  if (!isMkdirCommand(command)) return command;

  const path = extractMkdirPath(command);
  if (!path) return command;

  const expanded = expandBraces(path);
  if (expanded.length === 1 && expanded[0] === path) return command;

  const mkdirOptions = command.includes(' -p ') ? ' -p ' : ' ';
  const expandedPaths = expanded.join(' ');

  return `mkdir${mkdirOptions}${expandedPaths}`;
}

function hasBraceExpansion(command: string): boolean {
  const bracePattern = /{[^{}]+,/;
  return bracePattern.test(command);
}

export const BraceExpansionPlugin: Plugin = async () => {
  return {
    tool: {
      'brace-expand': tool({
        description: 'Expand bash brace expressions to see what directories would be created',
        args: {
          expression: tool.schema
            .string()
            .describe("Brace expression to expand (e.g., 'dir/{src,docs}')"),
        },
        async execute(args) {
          const expanded = expandBraces(args.expression);
          return `Brace expansion results:\n${expanded.join('\n')}`;
        },
      }),
    },

    async 'tool.execute.before'(input, output) {
      if (input.tool !== 'bash') return;

      const args = output.args as Readonly<Record<string, unknown>>;
      const command = (args.command as string) || '';

      if (hasBraceExpansion(command)) {
        const transformed = transformMkdirCommand(command);
        if (transformed !== command) {
          // eslint-disable-next-line functional/immutable-data
          output.args = { ...args, command: transformed };
        }
      }
    },
  };
};
