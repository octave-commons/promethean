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

export interface Context {
  id: string;
  sources: string[];
  text: string;
  compiled: unknown;
  timestamp: number;
}

export interface Message {
  id: string;
  type: string;
  content: unknown;
  timestamp: number;
}
