// SPDX-License-Identifier: GPL-3.0-only
// Process start action

import { tool } from '@opencode-ai/plugin/tool';
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

export const start: any = tool({
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
  async execute(args, _context) {
    const { command, args: cmdArgs = [], cwd, uid, gid } = args;

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
  },
});
