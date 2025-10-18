// SPDX-License-Identifier: GPL-3.0-only
// Process list action

import { tool } from '@opencode-ai/plugin/tool';
import { isRunning, activeProcesses } from './utils.js';

export const list = tool({
  description: 'List all active processes started by this tool (safe view)',
  args: {},
  async execute() {
    if (activeProcesses.size === 0) return 'No active processes';
    return Array.from(activeProcesses.values())
      .map((p) => {
        const age = Math.round((Date.now() - p.startedAt) / 1000);
        const running = isRunning(p.child.pid!);
        return `PID ${p.child.pid} • ${p.cmd} ${p.args.join(' ')} • cwd=${p.cwd} • ${running ? 'running' : 'exited'} • age=${age}s`;
      })
      .join('\n');
  },
});
