#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { argv, exit, stdin } from "node:process";
import { ContextRegistry } from "./registry.js";
import type { ContextInit } from "./types/context.js";
import {
  parseConversationArgs,
  runTwoAgentConversation,
} from "./conversation.js";
import { EnsoClient } from "./client.js";
import {
  connectWebSocket,
  type WebSocketConnectionHandle,
} from "./transport.js";
import type { HelloCaps } from "./types/privacy.js";
import type { ChatMessage } from "./types/content.js";
import {
  createNodeAudioCapture,
  pumpAudioFrames,
  type AudioCapture,
} from "./audio.js";

interface DemoDependencies {
  createClient?: () => EnsoClient;
  connect?: (
    client: EnsoClient,
    options: { url: string; hello: HelloCaps; pingIntervalMs?: number },
  ) => WebSocketConnectionHandle;
  createCapture?: (options: { streamId: string }) => Promise<AudioCapture>;
  hello?: HelloCaps;
  waitForAgentTimeoutMs?: number;
}

export interface CliDependencies {
  registry?: ContextRegistry;
  log?: (message: string) => void;
  error?: (message: string) => void;
  exit?: (code: number) => never;
  args?: string[];
  demo?: DemoDependencies;
}

const defaultRegistry = new ContextRegistry();

const DEFAULT_HELLO: HelloCaps = {
  proto: "ENSO-1",
  caps: ["can.send.text", "can.voice.stream"],
  privacy: { profile: "pseudonymous" },
};

interface VoiceDemoArgs {
  url: string;
  streamId?: string;
  pingIntervalMs?: number;
}

function parseVoiceDemoArgs(args: string[]): VoiceDemoArgs {
  const result: VoiceDemoArgs = { url: "ws://127.0.0.1:8787" };
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--url" && args[index + 1]) {
      result.url = args[index + 1]!;
      index += 1;
    } else if (token === "--stream-id" && args[index + 1]) {
      result.streamId = args[index + 1]!;
      index += 1;
    } else if (token === "--ping" && args[index + 1]) {
      const parsed = Number.parseInt(args[index + 1]!, 10);
      if (!Number.isNaN(parsed)) {
        result.pingIntervalMs = parsed;
      }
      index += 1;
    }
  }
  return result;
}

function formatChatMessage(message: ChatMessage | undefined): string {
  if (!message) {
    return "";
  }
  const parts = message.parts
    .map((part) => {
      if (part.kind === "text") {
        return part.text;
      }
      if (part.kind === "image") {
        return `[image ${part.mime}]`;
      }
      return `[attachment ${part.mime}]`;
    })
    .filter((value) => value.length > 0);
  return parts.join(" ") || message.role;
}

function formatTranscript(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const candidate = payload as { text?: string; data?: string };
    if (candidate.text) {
      return candidate.text;
    }
    if (candidate.data) {
      return candidate.data;
    }
  }
  return JSON.stringify(payload);
}

async function runVoiceDemo(
  args: string[],
  deps: Required<Pick<CliDependencies, "log" | "error">> & {
    demo?: DemoDependencies;
  },
): Promise<void> {
  const parsed = parseVoiceDemoArgs(args);
  const streamId = parsed.streamId ?? randomUUID();
  const hello = deps.demo?.hello ?? DEFAULT_HELLO;
  const createClient = deps.demo?.createClient ?? (() => new EnsoClient());
  const client = createClient();
  const connectFn =
    deps.demo?.connect ??
    ((instance, options) => {
      const transportOptions =
        options.pingIntervalMs !== undefined
          ? { pingIntervalMs: options.pingIntervalMs }
          : {};
      return connectWebSocket(
        instance,
        options.url,
        options.hello,
        transportOptions,
      );
    });
  const connection = connectFn(
    client,
    parsed.pingIntervalMs !== undefined
      ? { url: parsed.url, hello, pingIntervalMs: parsed.pingIntervalMs }
      : { url: parsed.url, hello },
  );

  deps.log(`Connecting to ${parsed.url} as stream ${streamId}`);
  deps.log("Speak into the microphone or pipe PCM16 audio via stdin.");

  const transcriptListeners = [
    client.on("stream:transcript.partial", (env) => {
      deps.log(`[partial] ${formatTranscript(env.payload)}`);
    }),
    client.on("stream:transcript.final", (env) => {
      deps.log(`[final] ${formatTranscript(env.payload)}`);
    }),
  ];

  let captureHandle: AudioCapture | undefined;
  client.voice.onFlowControl({
    onPause: async (flowStreamId) => {
      deps.log(`[flow] pause ${flowStreamId}`);
      await captureHandle?.stop();
    },
    onResume: (flowStreamId) => {
      deps.log(`[flow] resume ${flowStreamId}`);
    },
  });

  const agentPromise = new Promise<void>((resolve) => {
    client.on("event:chat.msg", (env) => {
      const payload = env.payload as { message?: ChatMessage } | undefined;
      deps.log(`[agent] ${formatChatMessage(payload?.message)}`);
      resolve();
    });
  });

  const createCapture =
    deps.demo?.createCapture ??
    (async (options: { streamId: string }) => {
      stdin.resume();
      return createNodeAudioCapture({
        stream: stdin,
        streamId: options.streamId,
      });
    });

  try {
    await connection.ready;
    captureHandle = await createCapture({ streamId });
    client.voice.register(streamId, 0);
    await pumpAudioFrames(captureHandle, async (frame) => {
      await client.voice.sendFrame(frame);
    });
    const timeoutMs = deps.demo?.waitForAgentTimeoutMs ?? 20000;
    if (timeoutMs > 0) {
      await Promise.race([
        agentPromise,
        new Promise<void>((resolve) => {
          setTimeout(() => {
            deps.log("[demo] agent reply timeout elapsed");
            resolve();
          }, timeoutMs);
        }),
      ]);
    } else {
      await agentPromise;
    }
  } finally {
    await captureHandle?.stop();
    await connection.close();
    transcriptListeners.forEach((unsubscribe) => unsubscribe());
  }
}

async function listSources(
  registry: ContextRegistry,
  log: (message: string) => void,
): Promise<void> {
  const sources = registry.listSources();
  log(JSON.stringify(sources, null, 2));
}

async function createDemoContext(
  registry: ContextRegistry,
  log: (message: string) => void,
): Promise<void> {
  if (registry.listSources().length === 0) {
    registry.registerSource({
      id: { kind: "enso-asset", location: "enso://asset/demo" },
      owners: [{ userId: "demo" }],
      discoverability: "visible",
      availability: { mode: "public" },
      title: "Demo Asset",
    });
  }
  const demo: ContextInit = {
    name: "demo",
    owner: { userId: "demo" },
    entries: registry.listSources().map((source) => ({
      id: source.id,
      state: "pinned",
      permissions: { readable: true },
    })),
  };
  const ctx = registry.createContext(demo);
  log(JSON.stringify(ctx, null, 2));
}

function showHelp(log: (message: string) => void): void {
  log(`enso-protocol CLI

Commands:
  help                  Show this message
  list-sources          Print registered data sources
  create-demo-context   Register a demo source and emit a context snapshot
  voice-demo            Stream microphone audio and print agent transcripts
  two-agent-chat        Start a dual-agent conversation (args: [agentA,agentB] [--ollama] [--edn path])
`);
}

export async function runCliCommand(
  command: string,
  deps: CliDependencies = {},
): Promise<void> {
  const registry = deps.registry ?? defaultRegistry;
  const log = deps.log ?? console.log;
  const error = deps.error ?? console.error;
  const exitFn = deps.exit ?? exit;

  switch (command) {
    case "help":
      showHelp(log);
      return;
    case "list-sources":
      await listSources(registry, log);
      return;
    case "create-demo-context":
      await createDemoContext(registry, log);
      return;
    case "voice-demo":
      await runVoiceDemo(deps.args ?? [], {
        log,
        error,
        ...(deps.demo ? { demo: deps.demo } : {}),
      });
      return;
    case "two-agent-chat": {
      const parsed = parseConversationArgs(deps.args ?? []);
      await runTwoAgentConversation({
        ...(parsed.agentNames ? { agentNames: parsed.agentNames } : {}),
        ...(parsed.configPath ? { configPath: parsed.configPath } : {}),
        useOllama: parsed.useOllama,
        log,
        error,
      });
      return;
    }
    default:
      error(`Unknown command: ${command}`);
      exitFn(1);
  }
}

async function main(): Promise<void> {
  const [command = "help", ...args] = argv.slice(2);
  await runCliCommand(command, { args });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    exit(1);
  });
}
