// SPDX-License-Identifier: GPL-3.0-only
// Process status action

import { isRunning } from './utils.js';

export interface StatusOptions {
  pid: number;
}

// Pure action function for checking process status
export async function checkProcessStatus(options: StatusOptions): Promise<string> {
  const { pid } = options;
  return isRunning(pid) ? `Process ${pid} is running` : `Process ${pid} is not running`;
}
