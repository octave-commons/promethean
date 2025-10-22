// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for process tools

import { tool } from '@opencode-ai/plugin/tool';
import {
  startProcess,
  stopProcess,
  listProcesses,
  checkProcessStatus,
  tailProcessOutput,
  tailProcessError,
  type StartProcessOptions,
  type StopProcessOptions,
  type StatusOptions,
  type TailOptions,
} from '../actions/index.js';

// Factory for startProcess tool
export function createStartProcessTool(): any {
  return tool({
    description:
      'Asyncronously spawn a long running process in background (hardened). Use this for servers, watchers, etc.',
    args: {
      command: tool.schema.string().describe('Allowed executable basename (e.g. "node")'),
      args: tool.schema.array(tool.schema.string()).default([]).describe('Arguments'),
      cwd: tool.schema.string().describe('Working directory (must be under SAFE_ROOT)'),
      uid: tool.schema
        .number()
        .optional()
        .describe('Drop privileges to this numeric uid (POSIX only)'),
      gid: tool.schema
        .number()
        .optional()
        .describe('Drop privileges to this numeric gid (POSIX only)'),
    },
    async execute(args) {
      const result = await startProcess(args as StartProcessOptions);
      return result;
    },
  });
}

// Factory for stopProcess tool
export function createStopProcessTool(): any {
  return tool({
    description: 'Stop a long running process by PID (group-aware, cross-platform)',
    args: {
      pid: tool.schema.number().describe('PID to stop'),
      signal: tool.schema.string().default('SIGTERM').describe('Signal to send (POSIX only)'),
      timeoutMs: tool.schema.number().default(5000).describe('Grace period before force-kill'),
    },
    async execute(args) {
      const result = await stopProcess(args as StopProcessOptions);
      return result;
    },
  });
}

// Factory for listProcesses tool
export function createListProcessesTool(): any {
  return tool({
    description: 'List all active processes started by this tool (safe view)',
    args: {},
    async execute() {
      const result = await listProcesses();
      return result;
    },
  });
}

// Factory for processStatus tool
export function createProcessStatusTool(): any {
  return tool({
    description: 'Check the status of a process by PID',
    args: {
      pid: tool.schema.number().describe('PID to check'),
    },
    async execute(args) {
      const result = await checkProcessStatus(args as StatusOptions);
      return result;
    },
  });
}

// Factory for tailProcessLogs tool (stdout)
export function createTailProcessLogsTool(): any {
  return tool({
    description: 'Tail the stdout (ring buffer) of a process by PID',
    args: {
      pid: tool.schema.number().describe('PID to tail'),
      lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
    },
    async execute(args) {
      const result = await tailProcessOutput(args as TailOptions);
      return result;
    },
  });
}

// Factory for tailProcessError tool (stderr)
export function createTailProcessErrorTool(): any {
  return tool({
    description: 'Tail the stderr (ring buffer) of a process by PID',
    args: {
      pid: tool.schema.number().describe('PID to tail'),
      lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
    },
    async execute(args) {
      const result = await tailProcessError(args as TailOptions);
      return result;
    },
  });
}

// Export all factory functions
export const processToolFactories = {
  createStartProcessTool,
  createStopProcessTool,
  createListProcessesTool,
  createProcessStatusTool,
  createTailProcessLogsTool,
  createTailProcessErrorTool,
};
