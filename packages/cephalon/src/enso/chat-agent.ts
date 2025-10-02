import EventEmitter from 'node:events';
import { randomUUID } from 'node:crypto';

import type { ChatMessage } from '@promethean/enso-protocol';
import { EnsoClient, EnsoServer, connectWebSocket, connectLocal } from '@promethean/enso-protocol';

export type ChatRole = 'human' | 'assistant' | 'system';

export type ChatAgentOpts = {
  /** ENSO ws:// url. If omitted, a local in-memory server is used (for tests/dev). */
  url?: string;
  /** Room name to send/receive messages in. */
  room?: string;
  /** Optional privacy profile override */
  privacyProfile?: 'pseudonymous' | 'ephemeral' | 'persistent';
};

export type ChatEvent =
  | { type: 'connected'; room: string }
  | { type: 'disconnected' }
  | { type: 'message'; message: ChatMessage };

/**
 * Minimal ENSO-compliant chat adaptor for Cephalon's "duck" persona.
 *  - Handshakes with caps: can.send.text, can.context.apply, can.tool.call
 *  - Emits/receives content.post messages in a single room.
 */
export class EnsoChatAgent extends EventEmitter {
  private client: EnsoClient;
  private server?: EnsoServer; // only in local mode
  private disconnect?: () => void;
  private readonly room: string;

  constructor(private readonly opts: ChatAgentOpts = {}) {
    super();
    this.client = new EnsoClient();
    this.room = opts.room ?? 'duck:chat';
  }

  /** Connect to ENSO, either over ws:// or locally for tests */
  async connect(): Promise<void> {
    const hello = {
      proto: 'ENSO-1' as const,
      caps: ['can.send.text', 'can.context.apply', 'can.tool.call'] as const,
      agent: { name: 'duck', version: '0.1.0' },
      privacy: this.opts.privacyProfile ? { profile: this.opts.privacyProfile } : undefined,
    };

    if (this.opts.url) {
      const handle = connectWebSocket(this.client, this.opts.url, hello);
      this.disconnect = handle.disconnect;
    } else {
      // local loop for tests/dev
      this.server = new EnsoServer();
      const { disconnect } = await connectLocal(this.client, this.server, hello);
      this.disconnect = disconnect;
    }

    // listen to inbound content.post
    this.client.on('event:content.post', (env) => {
      if (env.room !== this.room) return;
      const msg = (env.payload as any)?.message as ChatMessage | undefined;
      if (!msg) return;
      this.emit('message', { type: 'message', message: msg });
    });

    this.emit('connected', { type: 'connected', room: this.room });
  }

  /** Send a user message into the room as content.post */
  async sendText(role: ChatRole, text: string): Promise<void> {
    const message: ChatMessage = {
      id: randomUUID(),
      role,
      parts: [{ kind: 'text', text }],
      when: Date.now(),
    };
    await this.client.post({ room: this.room, message });
  }

  /** Clean shutdown */
  async dispose(): Promise<void> {
    this.disconnect?.();
    this.disconnect = undefined;
  }
}

export const createEnsoChatAgent = (opts: ChatAgentOpts = {}) => new EnsoChatAgent(opts);
