// SPDX-License-Identifier: GPL-3.0-only
// Process action types

import { type ChildProcess } from 'child_process';

export type RingBuffer = {
  size: number;
  lines: string[];
  push: (line: string) => void;
  snapshot: (n: number) => string[];
};

export type ProcInfo = {
  child: ChildProcess;
  cmd: string;
  args: string[];
  cwd: string;
  startedAt: number;
  pgidTarget: number; // negative pid for group kill on POSIX; plain pid on Windows
  stdoutBuf: RingBuffer;
  stderrBuf: RingBuffer;
};
