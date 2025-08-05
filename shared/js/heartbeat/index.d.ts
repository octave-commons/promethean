
export interface HeartbeatOptions {
  url?: string;
  pid?: number;
  name?: string;
  interval?: number;
}

export class HeartbeatClient {
  constructor(options?: HeartbeatOptions);
  sendOnce(): Promise<any>;
  start(): void;
  stop(): void;
}
