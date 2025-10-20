export interface ToolPort {
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
}

export interface ContextPort {
  compile(sources: string[], text: string): Promise<Context>;
  get(id: string): Promise<Context | null>;
  save(context: Context): Promise<void>;
}

export interface ActorPort {
  tick(actorId: string): Promise<void>;
  create(config: ActorConfig): Promise<string>;
  get(id: string): Promise<Actor | null>;
}

export interface LlmPort {
  complete(messages: Message[], opts?: { model?: string; temperature?: number }): Promise<Message>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Context {
  id: string;
  sources: string[];
  text: string;
  compiled: unknown;
  timestamp: number;
}

export interface Actor {
  id: string;
  config: ActorConfig;
  state: unknown;
  lastTick: number;
}

export interface ActorConfig {
  name: string;
  type: 'llm' | 'tool' | 'composite';
  parameters: Record<string, unknown>;
}
