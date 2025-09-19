import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import { Router, type RouteHandler } from "./router.js";

export interface EnsoServerOptions {
  router?: Router;
  validate?: (raw: unknown) => Envelope;
}

export interface ServerSession {
  id: string;
}

export class EnsoServer extends EventEmitter {
  private readonly router: Router;
  private readonly validate: (raw: unknown) => Envelope;

  constructor(options: EnsoServerOptions = {}) {
    super();
    this.router = options.router ?? new Router();
    this.validate =
      options.validate ?? ((raw) => raw as Envelope);
  }

  register(type: string, handler: RouteHandler): void {
    this.router.register(type, handler);
  }

  createSession(): ServerSession {
    const session: ServerSession = { id: randomUUID() };
    this.emit("session", session);
    return session;
  }

  async dispatch(session: ServerSession, raw: unknown): Promise<void> {
    const envelope = this.validate(raw);
    await this.router.handle(
      {
        sessionId: session.id,
        send: (response) => this.emit("message", session, response),
      },
      envelope,
    );
  }
}
