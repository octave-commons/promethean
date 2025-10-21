// SPDX-License-Identifier: GPL-3.0-only
// Process tail actions

import { activeProcesses } from './utils.js';

export interface TailOptions {
  pid: number;
  lines?: number;
}

// Pure action function for tailing stdout
export async function tailProcessOutput(options: TailOptions): Promise<string> {
  const { pid, lines = 100 } = options;

  const info = activeProcesses.get(pid);
  if (!info) throw new Error(`No active process found with PID: ${pid}`);
  const n = Math.max(1, Math.min(lines, info.stdoutBuf.size));
  return info.stdoutBuf.snapshot(n).join('\n') || `(no stdout yet)`;
}

// Pure action function for tailing stderr
export async function tailProcessError(options: TailOptions): Promise<string> {
  const { pid, lines = 100 } = options;

  const info = activeProcesses.get(pid);
  if (!info) throw new Error(`No active process found with PID: ${pid}`);
  const n = Math.max(1, Math.min(lines, info.stderrBuf.size));
  return info.stderrBuf.snapshot(n).join('\n') || `(no stderr yet)`;
}
