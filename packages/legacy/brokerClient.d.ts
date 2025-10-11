export interface BrokerOptions {
  host?: string;
  port?: number;
  timeout?: number;
  url?: string;
  id?: string;
}

export interface Task {
  id: string;
  queue: string;
  data: any;
}

export class BrokerClient {
  constructor(options?: BrokerOptions);
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(type: string, payload: any, opts?: any): void;
  subscribe(topic: string, handler: (message: any) => void): Promise<void>;
  unsubscribe(topic: string): void;
  enqueue(queue: string, task: any): Promise<void>;
  onTaskReceived(handler: (task: Task) => void): void;
  ack(taskId: string): void;
  ready(queue: string): void;
  socket: any;
}

export function createBrokerClient(options?: BrokerOptions): BrokerClient;
