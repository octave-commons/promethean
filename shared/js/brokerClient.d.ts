import type { WebSocket } from "ws";

export class BrokerClient {
  socket: WebSocket | null;
  constructor(options?: { url?: string; id?: string });
  connect(): Promise<void>;
  subscribe(topic: string, handler: (event: any) => void): void;
  unsubscribe(topic: string): void;
  publish(type: string, payload: any, opts?: any): void;
  enqueue(queue: string, task: any): void;
  ready(queue: string): void;
  ack(taskId: string): void;
  heartbeat(): void;
  onTaskReceived(callback: (task: any) => void): void;
}
