// SPDX-License-Identifier: GPL-3.0-only
export interface HeartbeatOptions {
  url?: string;
  pid?: number;
  name?: string;
  interval?: number;
  onHeartbeat?: (data: HeartbeatData) => void;
}

export interface HeartbeatData {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  netRx: number;
  netTx: number;
  status?: string;
  [key: string]: any;
}

export class HeartbeatClient {
  constructor(options?: HeartbeatOptions);
  url: string;
  pid: number;
  name: string;
  interval: number;
  onHeartbeat?: (data: HeartbeatData) => void;
  sendOnce(): Promise<void>;
  start(): void;
  stop(): void;
}
