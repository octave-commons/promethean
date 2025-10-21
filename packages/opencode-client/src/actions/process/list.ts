// SPDX-License-Identifier: GPL-3.0-only
// Process list action

import { isRunning, activeProcesses } from './utils.js';

export interface ProcessInfo {
  pid: number;
  cmd: string;
  args: string[];
  cwd: string;
  running: boolean;
  age: number;
}

// Pure action function for listing processes
export async function listProcesses(): Promise<string> {
  if (activeProcesses.size === 0) return 'No active processes';
  return Array.from(activeProcesses.values())
    .map((p) => {
      const age = Math.round((Date.now() - p.startedAt) / 1000);
      const running = isRunning(p.child.pid!);
      return `PID ${p.child.pid} • ${p.cmd} ${p.args.join(' ')} • cwd=${p.cwd} • ${running ? 'running' : 'exited'} • age=${age}s`;
    })
    .join('\n');
}

// Alternative version that returns structured data
export async function getProcessList(): Promise<ProcessInfo[]> {
  return Array.from(activeProcesses.values()).map((p) => {
    const age = Math.round((Date.now() - p.startedAt) / 1000);
    const running = isRunning(p.child.pid!);
    return {
      pid: p.child.pid!,
      cmd: p.cmd,
      args: p.args,
      cwd: p.cwd,
      running,
      age,
    };
  });
}
