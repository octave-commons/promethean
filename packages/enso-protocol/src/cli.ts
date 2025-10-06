#!/usr/bin/env node
import { argv, exit } from 'node:process';
import { randomUUID } from 'node:crypto';
import { ContextRegistry } from './registry.js';
import type { ContextInit } from './types/context.js';
import { parseConversationArgs, runTwoAgentConversation } from './conversation.js';
import { EnsoClient } from './client.js';
import { connectWebSocket, type WebSocketConnectionHandle } from './transport.js';
import type { HelloCaps } from './types/privacy.js';
import type { ChatMessage, ContentPart, TextPart } from './types/content.js';
import { createNodeAudioCapture, pumpAudioFrames, type AudioCapture } from './audio.js';

interface DemoDependencies {
  createClient?: () => EnsoClient;
  connect?: (
    client: EnsoClient,
    options:
      | { url: string; hello: HelloCaps }
      | { url: string; hello: HelloCaps; pingIntervalMs: number },
  ) => WebSocketConnectionHandle;
  createCapture?: (options: { streamId: string }) => Promise<AudioCapture>;
  waitForAgentTimeoutMs?: number;
  hello?: HelloCaps;
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
  proto: 'ENSO-1',
  caps: ['can.send.text', 'can.voice.stream'],
  agent: { name: 'enso-cli', version: '0.0.0' },
};

function formatTranscript(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload && typeof payload === 'object') {
    const withText = payload as { text?: unknown };
    if (typeof withText.text === 'string' && withText.text.length > 0) {
      return withText.text;
    }
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

function partsToText(parts: ContentPart[]): string {
  const texts = parts.filter((p): p is TextPart => p.kind === 'text').map((p) => p.text);
  return texts.join(' ');
}

function formatChatMessage(msg?: ChatMessage): string {
  if (!msg) return '';
  const text = partsToText(msg.parts);
  return text || JSON.stringify(msg);
}

async function runVoiceDemo(
  args: string[],
  deps: Required<Pick<CliDependencies, 'log' | 'error'>> & {
    demo?: DemoDependencies;
  },
): Promise<void> {
  const parsed = (() => {
    let url: string = 'ws://localhost:7766/ws';
    let pingIntervalMs: number | undefined;
    for (let i = 0; i < args.length; i += 1) {
      const a = args[i];
      if (a === '--url' && args[i + 1]) {
        url = String(args[i + 1]);
        i += 1;
      } else if ((a === '--ping' || a === '--ping-interval') && args[i + 1]) {
        const v = Number(args[i + 1]);
        if (!Number.isNaN(v)) pingIntervalMs = v;
        i += 1;
      }
    }
    return { url, pingIntervalMs };
  })();

  const streamId = randomUUID();
  const hello = deps.demo?.hello ?? DEFAULT_HELLO;
  const createClient = deps.demo?.createClient ?? (() => new EnsoClient());
  const client = createClient();
  const connectFn =
    deps.demo?.connect ??
    ((instance, options) => {
      const transportOptions =
        'pingIntervalMs' in options && options.pingIntervalMs !== undefined
          ? { pingIntervalMs: options.pingIntervalMs }
          : {};
      return connectWebSocket(instance, options.url, options.hello, transportOptions);
    });
  const connection = connectFn(
    client,
    parsed.pingIntervalMs !== undefined
      ? { url: parsed.url, hello, pingIntervalMs: parsed.pingIntervalMs }
      : { url: parsed.url, hello },
  );

  (deps.log ?? console.log)(`Connecting to ${parsed.url} as stream ${streamId}`);
  (deps.log ?? console.log)('Speak into the microphone or pipe PCM16 audio via stdin.');

  const transcriptListeners = [
    client.on('stream:transcript.partial', (env) => {
      (deps.log ?? console.log)(`[partial] ${formatTranscript(env.payload)}`);
    }),
    client.on('stream:transcript.final', (env) => {
      (deps.log ?? console.log)(`[final] ${formatTranscript(env.payload)}`);
    }),
  ];

  let captureHandle: AudioCapture | undefined;
  client.voice.onFlowControl({
    onPause: async (flowStreamId) => {
      (deps.log ?? console.log)(`[flow] pause ${flowStreamId}`);
      await captureHandle?.stop();
    },
    onResume: (flowStreamId) => {
      (deps.log ?? console.log)(`[flow] resume ${flowStreamId}`);
    },
  });

  const agentPromise = new Promise<void>((resolve) => {
    client.on('event:chat.msg', (env) => {
      const payload = env.payload as { message?: ChatMessage } | undefined;
      (deps.log ?? console.log)(`[agent] ${formatChatMessage(payload?.message)}`);
      resolve();
    });
  });

  const createCapture =
    deps.demo?.createCapture ??
    (async (options: { streamId: string }) => {
      const { stdin } = await import('node:process');
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
            (deps.log ?? console.log)('[demo] agent reply timeout elapsed');
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
      id: { kind: 'enso-asset', location: 'enso://asset/demo' },
      owners: [{ userId: 'demo' }],
      discoverability: 'visible',
      availability: { mode: 'public' },
      title: 'Demo Asset',
    });
  }
  const demo: ContextInit = {
    name: 'demo',
    owner: { userId: 'demo' },
    entries: registry.listSources().map((source) => ({
      id: source.id,
      state: 'pinned',
      permissions: { readable: true },
    })),
  };
  const ctx = registry.createContext(demo);
  log(JSON.stringify(ctx, null, 2));
}

function parseServerArgs(args: string[]): { port?: number } {
  return args.reduce<{ port?: number }>((acc, cur, i, arr) => {
    if (cur === '--port' || cur === '-p') {
      const v = Number(arr[i + 1]);
      if (!Number.isNaN(v)) return { ...acc, port: v };
    }
    return acc;
  }, {});
}

function showHelp(log: (message: string) => void): void {
  log(`enso-protocol CLI

Commands:
  help                  Show this message
  list-sources          Print registered data sources
  create-demo-context   Register a demo source and emit a context snapshot
  voice-demo            Stream microphone audio and print agent transcripts
  two-agent-chat        Start a dual-agent conversation (args: [agentA,agentB] [--ollama] [--edn path])
  server                Start WS server (options: --port <n>, default 7766)
`);
}

export async function runCliCommand(command: string, deps: CliDependencies = {}): Promise<void> {
  const registry = deps.registry ?? defaultRegistry;
  const log = deps.log ?? console.log;
  const error = deps.error ?? console.error;
  const exitFn = deps.exit ?? ((code: number) => exit(code));

  switch (command) {
    case 'help':
      showHelp(log);
      return;
    case 'list-sources':
      await listSources(registry, log);
      return;
    case 'create-demo-context':
      await createDemoContext(registry, log);
      return;
    case 'voice-demo':
      await runVoiceDemo(deps.args ?? [], {
        log,
        error,
        ...(deps.demo ? { demo: deps.demo } : {}),
      });
      return;
    case 'two-agent-chat': {
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
    case 'server': {
      const { port } = parseServerArgs(deps.args ?? []);
      if (port !== undefined) process.env.ENSO_PORT = String(port);
      await import('./ws-server.js');
      log(
        `[enso] ws server boot requested on :${
          process.env.ENSO_PORT ?? process.env.PORT ?? '7766'
        }`,
      );
      return;
    }
    default:
      error(`Unknown command: ${command}`);
      exitFn(1);
  }
}

async function main(): Promise<void> {
  const [command = 'help', ...args] = argv.slice(2);
  await runCliCommand(command, { args });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    exit(1);
  });
}
