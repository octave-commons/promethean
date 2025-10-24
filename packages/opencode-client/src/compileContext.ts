import { Message, contextStore } from './index.js';

export async function compileContext(
  textsOrOptions:
    | readonly string[]
    | {
        readonly texts?: readonly string[];
        readonly recentLimit?: number;
        readonly queryLimit?: number;
        readonly limit?: number;
        readonly formatAssistantMessages?: boolean;
      } = [],
  ...legacyArgs: readonly [number?, number?, number?, boolean?]
): Promise<Message[]> {
  // Cast the return type since ContextStore returns ollama.Message which is compatible
  return contextStore.compileContext(textsOrOptions as any, ...legacyArgs) as Promise<Message[]>;
}
