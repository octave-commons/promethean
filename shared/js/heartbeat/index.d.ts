export class HeartbeatClient {
  constructor(options?: {
    url?: string;
    pid?: number;
    name?: string;
    interval?: number;
  });
  sendOnce(): Promise<any>;
  start(): void;
  stop(): void;
}
