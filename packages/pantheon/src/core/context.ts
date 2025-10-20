import type { ContextPort, Context } from './ports.js';

export function makeContextAdapter(): ContextPort {
  // Create a simple in-memory store for now since we need collections
  const contexts = new Map<string, Context>();

  return {
    async compile(sources: string[], text: string): Promise<Context> {
      const id = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const compiled = { sources, text, processed: true };

      const context: Context = {
        id,
        sources,
        text,
        compiled,
        timestamp: Date.now(),
      };

      contexts.set(id, context);
      return context;
    },

    async get(id: string): Promise<Context | null> {
      return contexts.get(id) || null;
    },

    async save(context: Context): Promise<void> {
      contexts.set(context.id, context);
    },
  };
}
