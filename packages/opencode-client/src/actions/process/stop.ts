// SPDX-License-Identifier: GPL-3.0-only
// Process stop action

import { terminateProcessTree, activeProcesses } from './utils.js';

export interface StopProcessOptions {
  pid: number;
  signal?: string;
  timeoutMs?: number;
}

// Pure action function for stopping a process
export async function stopProcess(options: StopProcessOptions): Promise<string> {
  const { pid, signal = 'SIGTERM', timeoutMs = 5000 } = options;

  const info = activeProcesses.get(pid);
  if (!info) throw new Error(`No active process found with PID: ${pid}`);

  await terminateProcessTree(info, signal as NodeJS.Signals, timeoutMs);

  activeProcesses.delete(pid);
  return `Stopped PID ${pid}`;
}
