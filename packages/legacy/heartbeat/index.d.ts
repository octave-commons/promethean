export interface HeartbeatClientOptions {
  url?: string;
  pid?: number;
  name?: string;
  interval?: number;
  onHeartbeat?: (data: { pid: number; name: string }) => void;
  maxMisses?: number;
  fatalOnMiss?: boolean;
}

export class HeartbeatClient {
  constructor(options?: HeartbeatClientOptions);
  sendOnce(): Promise<void>;
  start(): void;
  stop(): void;
}
