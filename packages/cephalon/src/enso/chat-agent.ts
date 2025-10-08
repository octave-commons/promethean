import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";

import type {
  ActRationalePayload,
  ChatMessage,
} from "@promethean/enso-protocol";
import {
  EnsoClient,
  EnsoServer,
  connectWebSocket,
  connectLocal,
  ToolRegistry,
} from "@promethean/enso-protocol";
import type { HelloCaps } from "@promethean/enso-protocol";
import type { ToolCall } from "@promethean/enso-protocol/dist/types/tools.js";

type ToolInvocationOptions = {
  provider: ToolCall["provider"];
  name: ToolCall["name"];
  args?: ToolCall["args"];
  serverId?: ToolCall["serverId"];
  ttlMs?: ToolCall["ttlMs"];
  callId?: ToolCall["callId"];
  reason?: string;
  evidence?: readonly string[];
  policy?: ActRationalePayload["policy"];
  evidenceKind?: ActRationalePayload["evidenceKind"];
};

export type ChatRole = "human" | "agent" | "system";

export type ChatAgentOpts = {
  /** ENSO ws:// url. If omitted, a local in-memory server is used (for tests/dev). */
  url?: string;
  /** Room name to send/receive messages in. */
  room?: string;
  /** Optional privacy profile override */
  privacyProfile?: "pseudonymous" | "ephemeral" | "persistent";
};

export type ChatEvent =
  | { type: "connected"; room: string }
  | { type: "disconnected" }
  | { type: "message"; message: ChatMessage };

/**
 * Minimal ENSO-compliant chat adaptor for Cephalon's "duck" persona.
 *  - Handshakes with caps: can.send.text, can.context.apply, can.tool.call
 *  - Emits/receives content.post messages in a single room.
 *  - Advertises a couple of native tools (duck.ping, duck.help) via tool.advertise and answers tool.call.
 */
export class EnsoChatAgent extends EventEmitter {
  private client: EnsoClient;
  private server?: EnsoServer; // only in local mode
  private wsHandle?: {
    close: (code?: number, reason?: string) => Promise<void>;
  };
  private localHandle?: { disconnect: () => void };
  private readonly room: string;
  private readonly tools = new ToolRegistry();
  private readonly serverId = "cephalon-duck";
  private readonly defaultPolicy = "morganna@1";
  private evaluationMode = false;
  private sessionId?: string;

  constructor(private readonly opts: ChatAgentOpts = {}) {
    super();
    this.client = new EnsoClient();
    this.room = opts.room ?? "duck:chat";
  }

  /** Connect to ENSO, either over ws:// or locally for tests */
  async connect(): Promise<void> {
    const hello: HelloCaps = {
      proto: "ENSO-1",
      caps: ["can.send.text", "can.context.apply", "can.tool.call"],
      agent: { name: "duck", version: "0.1.0" },
      privacy: this.opts.privacyProfile
        ? { profile: this.opts.privacyProfile }
        : undefined,
    };

    let ready: Promise<void>;

    if (this.opts.url) {
      const handle = connectWebSocket(this.client, this.opts.url, hello);
      this.wsHandle = { close: handle.close };
      ready = handle.ready;
    } else {
      // local loop for tests/dev
      this.server = new EnsoServer();
      const { disconnect } = await connectLocal(
        this.client,
        this.server,
        hello,
      );
      this.localHandle = { disconnect };
      ready = Promise.resolve();
    }

    await ready;

    // register + advertise our native tools
    this.registerTools();
    this.advertiseTools();

    // listen to inbound content.post
    this.client.on("event:content.post", (env) => {
      if (env.room !== this.room) return;
      const msg = (env.payload as any)?.message as ChatMessage | undefined;
      if (!msg) return;
      this.emit("message", { type: "message", message: msg });
    });

    // answer tool.call for tools we advertised
    this.client.on("event:tool.call", async (env) => {
      const call = env.payload as unknown as ToolCall;
      if (
        (call as any)?.provider !== "native" ||
        (call as any)?.serverId !== this.serverId
      )
        return;
      try {
        const resultEnv = await this.tools.invokeEnvelope(call);
        this.client.send(resultEnv);
      } catch (err) {
        // As a last resort, send an error result
        this.client.send({
          id: randomUUID(),
          ts: new Date().toISOString(),
          room: "tool",
          from: "enso-tool-registry",
          kind: "event",
          type: "tool.result",
          payload: {
            callId: (call as any)?.callId,
            ok: false,
            error: String((err as any)?.message ?? err),
          },
        });
      }
    });

    this.client.on("event:room.flags", (env) => {
      const flags = (env.payload as any)?.flags;
      if (!flags || typeof flags !== "object") return;
      const nextEval = Boolean((flags as Record<string, unknown>).eval);
      this.evaluationMode = nextEval;
    });

    this.emit("connected", { type: "connected", room: this.room });
  }

  /** Send a user message into the room as content.post */
  async sendText(role: ChatRole, text: string): Promise<void> {
    const message: ChatMessage = {
      id: randomUUID(),
      role,
      parts: [{ kind: "text", text }],
      when: Date.now(),
    } as any;
    await this.client.post(message, { room: this.room });
  }

  /** Clean shutdown */
  async dispose(): Promise<void> {
    if (this.wsHandle) await this.wsHandle.close();
    this.localHandle?.disconnect();
    this.wsHandle = undefined;
    this.localHandle = undefined;
    this.sessionId = undefined;
    this.evaluationMode = false;
  }

  isEvaluationMode(): boolean {
    return this.evaluationMode;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  getLocalServer(): EnsoServer | undefined {
    return this.server;
  }

  async callTool(options: ToolInvocationOptions): Promise<string> {
    const callId = options.callId ?? randomUUID();
    const reason =
      options.reason ??
      "LLM requested tool invocation to satisfy the current user goal.";
    if (this.evaluationMode) {
      const rationale = this.composeRationaleText(callId, options, reason);
      const rationalePayload: ActRationalePayload = {
        callId,
        rationale,
        policy: options.policy ?? this.defaultPolicy,
        evidence:
          options.evidence && options.evidence.length > 0
            ? [...options.evidence]
            : undefined,
        evidenceKind: options.evidenceKind ?? "note",
      };
      await this.client.send({
        id: randomUUID(),
        ts: new Date().toISOString(),
        room: this.room,
        from: this.serverId,
        kind: "event",
        type: "act.rationale",
        payload: rationalePayload,
      });
    }

    const payload: ToolCall = {
      callId,
      provider: options.provider,
      name: options.name,
      args: options.args ?? {},
    } as ToolCall;

    if (options.serverId) {
      (payload as any).serverId = options.serverId;
    }
    if (options.ttlMs !== undefined) {
      (payload as any).ttlMs = options.ttlMs;
    }

    await this.client.send({
      id: randomUUID(),
      ts: new Date().toISOString(),
      room: this.room,
      from: this.serverId,
      kind: "event",
      type: "tool.call",
      payload,
    });

    return callId;
  }

  private composeRationaleText(
    callId: string,
    options: ToolInvocationOptions,
    reason: string,
  ): string {
    const toolDescriptor =
      options.provider === "mcp"
        ? `mcp:${options.serverId ?? "default"}/${options.name}`
        : `${options.provider}:${options.name}`;
    const header =
      "Applying Morganna guardrail decision rubric (see docs/design/enso-protocol/06-security-and-guardrails.md Morganna Guardrails section) before tool invocation.";
    const detail = `Tool call ${callId} targets ${toolDescriptor}. Reason: ${reason}`;
    const footer =
      "This disclosure satisfies the evaluation requirement to justify tool usage prior to tool.call.";
    return `${header} ${detail} ${footer}`;
  }

  private registerTools() {
    if (this.tools /* sentinel to avoid duplicate registration */) {
      // duck.ping
      this.tools.register(
        "native",
        {
          name: "duck.ping",
          handler: async (args: any) => {
            const echo = typeof args?.echo === "string" ? args.echo : null;
            return { pong: true, echo, at: new Date().toISOString() };
          },
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { echo: { type: "string" } },
          },
          timeoutMs: 2000,
        },
        this.serverId,
      );

      // duck.help
      this.tools.register(
        "native",
        {
          name: "duck.help",
          handler: async () =>
            this.tools
              .advertisement("native", this.serverId)
              .tools.map((t) => ({
                id: t.name,
                desc: t.schema ? "has schema" : "no schema",
              })),
        },
        this.serverId,
      );
    }
  }

  private advertiseTools() {
    const advert = this.tools.advertisementEnvelope("native", this.serverId);
    this.client.send(advert);
  }
}

export const createEnsoChatAgent = (opts: ChatAgentOpts = {}) =>
  new EnsoChatAgent(opts);
