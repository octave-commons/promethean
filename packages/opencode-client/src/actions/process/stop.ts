// SPDX-License-Identifier: GPL-3.0-only
// Process stop action

import { tool } from '@opencode-ai/plugin/tool';
import { terminateProcessTree, activeProcesses } from './utils.js';

export const stop: any = tool({
  description: 'Stop a long running process by PID (group-aware, cross-platform)',
  args: {
    pid: tool.schema.number().describe('PID to stop'),
    signal: tool.schema.string().default('SIGTERM').describe('Signal to send (POSIX only)'),
    timeoutMs: tool.schema.number().default(5000).describe('Grace period before force-kill'),
  },
  async execute(args, _context) {
    const { pid, signal = 'SIGTERM', timeoutMs = 5000 } = args;

    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);

    await terminateProcessTree(info, signal as NodeJS.Signals, timeoutMs);

    activeProcesses.delete(pid);
    return `Stopped PID ${pid}`;
  },
});
