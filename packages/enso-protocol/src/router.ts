import type { Envelope } from "./types/envelope.js";

export type RouteHandler = (
  context: RouteContext,
  envelope: Envelope,
) => void | Promise<void>;

export interface RouteContext {
  sessionId: string;
  send: (envelope: Envelope) => void;
}

export class Router {
  private readonly handlers = new Map<string, RouteHandler>();
  private fallback?: RouteHandler;

  register(type: string, handler: RouteHandler): this {
    this.handlers.set(type, handler);
    return this;
  }

  registerFallback(handler: RouteHandler): this {
    this.fallback = handler;
    return this;
  }

  async handle(context: RouteContext, envelope: Envelope): Promise<void> {
    const handler = this.handlers.get(envelope.type) ?? this.fallback;
    if (!handler) {
      return;
    }
    await handler(context, envelope);
  }
}
