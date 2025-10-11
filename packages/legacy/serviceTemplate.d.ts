export interface ServiceOptions {
  name: string;
  port?: number;
  host?: string;
  heartbeat?: boolean;
}

export interface StartServiceOptions {
  id: string;
  queues?: string[];
  topics?: string[];
  handleEvent?: (event: any) => Promise<void>;
  handleTask?: (task: any) => Promise<void>;
}

export abstract class ServiceTemplate {
  protected options: ServiceOptions;

  constructor(options: ServiceOptions);

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  getName(): string;
  getPort(): number;
  getHost(): string;

  protected log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

export function createServiceTemplate<T extends ServiceTemplate>(
  constructor: new (options: ServiceOptions) => T,
  options: ServiceOptions,
): T;

export function startService(options: StartServiceOptions): Promise<any>;
