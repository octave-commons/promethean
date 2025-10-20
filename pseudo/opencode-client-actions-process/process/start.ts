// SPDX-License-Identifier: GPL-3.0-only
// Process start action

import { spawn } from 'child_process';
import {
  resolveExecutable,
  resolveCwd,
  makeProcInfo,
  attachLogging,
  coerceCommandArgs,
  sanitizeEnv,
  activeProcesses,
} from './utils.js';

export interface StartProcessOptions {
  command: string;
  args?: string[];
  cwd: string;
  uid?: number;
  gid?: number;
}

// Pure action function for starting a process
export async function startProcess(options: StartProcessOptions): Promise<string> {
  const { command, args: cmdArgs = [], cwd, uid, gid } = options;

  // NEW: split only when args are missing
  const { cmd, argv } = coerceCommandArgs(command, cmdArgs);

  // existing: resolves + validates basename-only executable from allowlisted dirs
  const [exePath, safeCwd] = await Promise.all([
    resolveExecutable(cmd), // still enforces basename + allowlist
    resolveCwd(cwd),
  ]);

  const child = spawn(exePath, argv, {
    cwd: safeCwd,
    detached: process.platform !== 'win32',
    shell: false, // keep shell OFF
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: sanitizeEnv(),
    ...(typeof uid === 'number' ? { uid } : {}),
    ...(typeof gid === 'number' ? { gid } : {}),
  });

  if (!child.pid) throw new Error('Failed to start process: no PID');

  const info = makeProcInfo(child, cmd, argv, safeCwd);
  attachLogging(info);

  child.on('error', () => activeProcesses.delete(child.pid!));
  child.on('exit', () => activeProcesses.delete(child.pid!));

  activeProcesses.set(child.pid!, info);
  return `Started ${cmd} (PID ${child.pid}) in ${safeCwd}`;
}
