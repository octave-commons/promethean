// SPDX-License-Identifier: GPL-3.0-only
// Process tail actions

import { tool } from '@opencode-ai/plugin/tool';
import { activeProcesses } from './utils.js';

export const tail: any = tool({
  description: 'Tail the stdout (ring buffer) of a process by PID',
  args: {
    pid: tool.schema.number().describe('PID to tail'),
    lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
  },
  async execute({ pid, lines = 100 }) {
    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);
    const n = Math.max(1, Math.min(lines, info.stdoutBuf.size));
    return info.stdoutBuf.snapshot(n).join('\n') || `(no stdout yet)`;
  },
});

export const err: any = tool({
  description: 'Tail the stderr (ring buffer) of a process by PID',
  args: {
    pid: tool.schema.number().describe('PID to tail'),
    lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
  },
  async execute({ pid, lines = 100 }) {
    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);
    const n = Math.max(1, Math.min(lines, info.stderrBuf.size));
    return info.stderrBuf.snapshot(n).join('\n') || `(no stderr yet)`;
  },
});
