// SPDX-License-Identifier: GPL-3.0-only
// Process status action

import { tool } from '@opencode-ai/plugin/tool';
import { isRunning } from './utils.js';

export const status: any = tool({
  description: 'Check the status of a process by PID',
  args: { pid: tool.schema.number().describe('PID to check') },
  async execute({ pid }) {
    return isRunning(pid) ? `Process ${pid} is running` : `Process ${pid} is not running`;
  },
});
