import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { ToolFactory } from '../core/types.js';

// Minimal in-memory scaffolding for an async Ollama DSL toolset.
// Non-destructive MVP: queues jobs, stores templates & conversations; no execution yet.

export type UUID = string;
export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';
export type JobKind = 'generate' | 'chat' | 'template' | 'pull';

export type OllamaOptions = Readonly<{
  temperature?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  stop?: readonly string[];
}>;

export type Message = Readonly<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }>;

export type BaseJob = Readonly<{
  id: UUID;
  name?: string;
  kind: JobKind;
  createdAt: number;
  updatedAt: number;
  status: JobStatus;
  deps: readonly UUID[];
  error?: Readonly<{ message: string; code?: string }>;
}>;

export type GenerateJob = BaseJob &
  Readonly<{
    kind: 'generate';
    modelName: string;
    prompt: string;
    suffix?: string;
    options?: OllamaOptions;
  }>;

export type ChatJob = BaseJob &
  Readonly<{
    kind: 'chat';
    modelName: string;
    conversationId: UUID;
    options?: OllamaOptions;
  }>;

export type TemplateJob = BaseJob &
  Readonly<{
    kind: 'template';
    templateName: string;
    args: readonly unknown[];
  }>;

export type PullJob = BaseJob & Readonly<{ kind: 'pull'; modelName: string }>;

export type Job = GenerateJob | ChatJob | TemplateJob | PullJob;

export type Conversation = Readonly<{
  id: UUID;
  name?: string;
  systemPrompt?: string;
  messages: readonly Message[];
  createdAt: number;
  updatedAt: number;
}>;

export type TemplateDef = Readonly<{
  name: string;
  version: number;
  src: string;
  createdAt: number;
  updatedAt: number;
}>;

const now = () => Date.now();

const store = {
  templates: new Map<string, TemplateDef>(),
  conversations: new Map<UUID, Conversation>(),
  jobs: [] as Job[],
};

export const __resetOllamaForTests = () => {
  store.templates.clear();
  store.conversations.clear();
  store.jobs.splice(0, store.jobs.length);
};

const snapshot = () => {
  const pending = store.jobs.filter((j) => j.status === 'pending');
  const inProgress = store.jobs.filter((j) => j.status === 'running');
  const completed = store.jobs.filter(
    (j) => j.status === 'succeeded' || j.status === 'failed' || j.status === 'canceled',
  );
  return { pending, inProgress, completed } as const;
};

const enqueue = (job: Job) => {
  const pending = snapshot().pending.length;
  store.jobs = [...store.jobs, job];
  return { jobId: job.id, jobName: job.name, queuePosition: pending + 1 };
};

export const ollamaPull: ToolFactory = () => {
  const shape = { modelName: z.string().min(1) } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_pull',
    description: 'Queue a model pull (no-op executor in MVP)',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { modelName } = Schema.parse(raw);
    const id = randomUUID();
    const ts = now();
    return enqueue({
      id,
      kind: 'pull',
      modelName,
      name: undefined,
      createdAt: ts,
      updatedAt: ts,
      status: 'pending',
      deps: [],
    });
  };
  return { spec, invoke };
};

export const ollamaListModels: ToolFactory = () => {
  const spec = {
    name: 'ollama_list_models',
    description: 'List models (MVP returns empty; integrate Ollama HTTP later)',
  } as const;
  const invoke = async () => ({ models: [] as string[] });
  return { spec, invoke };
};

export const ollamaListTemplates: ToolFactory = () => {
  const spec = { name: 'ollama_list_templates', description: 'List registered templates' } as const;
  const invoke = async () => ({
    templates: [...store.templates.values()].map((t) => ({ name: t.name, version: t.version })),
  });
  return { spec, invoke };
};

export const ollamaCreateTemplate: ToolFactory = () => {
  const shape = { templateName: z.string().min(1), src: z.string().min(1) } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_create_template',
    description: 'Create or update a template (s-expr text stored verbatim)',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { templateName, src } = Schema.parse(raw);
    const prev = store.templates.get(templateName);
    const version = prev ? prev.version + 1 : 1;
    const rec: TemplateDef = {
      name: templateName,
      version,
      src,
      createdAt: prev?.createdAt ?? now(),
      updatedAt: now(),
    };
    store.templates.set(templateName, rec);
    return { name: templateName, version };
  };
  return { spec, invoke };
};

export const ollamaEnqueueJobFromTemplate: ToolFactory = () => {
  const shape = {
    jobName: z.string().optional(),
    templateName: z.string().min(1),
    args: z.array(z.any()).optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_enqueue_job_from_template',
    description: 'Queue a job that will execute a named template',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { jobName, templateName, args } = Schema.parse(raw);
    const id = randomUUID();
    const ts = now();
    if (!store.templates.has(templateName)) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return enqueue({
      id,
      name: jobName,
      kind: 'template',
      templateName,
      args: args ?? [],
      createdAt: ts,
      updatedAt: ts,
      status: 'pending',
      deps: [],
    });
  };
  return { spec, invoke };
};

export const ollamaStartConversation: ToolFactory = () => {
  const shape = {
    conversationName: z.string().optional(),
    initialMessage: z.string().optional(),
    systemPrompt: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_start_conversation',
    description: 'Create a conversation; optionally seeds initial user message',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { conversationName, initialMessage, systemPrompt } = Schema.parse(raw);
    const id = randomUUID();
    const ts = now();
    const emptyMsgs: ReadonlyArray<Message> = [];
    const base: Conversation = {
      id,
      name: conversationName,
      systemPrompt,
      messages: emptyMsgs,
      createdAt: ts,
      updatedAt: ts,
    };
    const seeded: Conversation = (() => {
      if (typeof initialMessage !== 'string' || initialMessage.length === 0) {
        return base;
      }
      const userMessage: Message = { role: 'user', content: initialMessage };
      const messages: readonly Message[] = [...base.messages, userMessage];
      return {
        ...base,
        messages,
        updatedAt: now(),
      } satisfies Conversation;
    })();
    store.conversations.set(id, seeded);
    return { conversationId: id, conversationName, jobId: undefined as string | undefined };
  };
  return { spec, invoke };
};

export const ollamaEnqueueGenerateJob: ToolFactory = () => {
  const shape = {
    jobName: z.string().optional(),
    modelName: z.string().min(1),
    prompt: z.string().min(1),
    suffix: z.string().optional(),
    options: z.record(z.any()).optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_enqueue_generate_job',
    description: 'Queue a text generation job (no execution in MVP)',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { jobName, modelName, prompt, suffix, options } = Schema.parse(raw);
    const id = randomUUID();
    const ts = now();
    return enqueue({
      id,
      name: jobName,
      kind: 'generate',
      modelName,
      prompt,
      suffix,
      options,
      createdAt: ts,
      updatedAt: ts,
      status: 'pending',
      deps: [],
    });
  };
  return { spec, invoke };
};

export const ollamaEnqueueChatCompletion: ToolFactory = () => {
  const shape = {
    jobName: z.string().optional(),
    modelName: z.string().min(1),
    ref: z.union([
      z.object({
        conversationId: z.string().uuid().optional(),
        conversationName: z.string().optional(),
      }),
      z.array(
        z.object({ role: z.enum(['system', 'user', 'assistant', 'tool']), content: z.string() }),
      ),
    ]),
    options: z.record(z.any()).optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_enqueue_chat_completion',
    description: 'Queue a chat completion against a conversation or raw messages',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { jobName, modelName, ref, options } = Schema.parse(raw);
    const id = randomUUID();
    const ts = now();
    let conversationId: string;
    if (Array.isArray(ref)) {
      // create ephemeral conversation
      conversationId = randomUUID();
      type ChatMessages = ReadonlyArray<Pick<Message, 'role' | 'content'>>;
      const rawMessages = ref as ChatMessages;
      const typedMessages = rawMessages.map(
        (m): Message => ({ role: m.role, content: m.content }),
      ) as readonly Message[];
      const conv: Conversation = {
        id: conversationId,
        messages: typedMessages,
        createdAt: ts,
        updatedAt: ts,
      };
      store.conversations.set(conversationId, conv);
    } else {
      const { conversationId: cid, conversationName } = ref as {
        conversationId?: string;
        conversationName?: string;
      };
      if (cid && store.conversations.has(cid)) {
        conversationId = cid;
      } else if (conversationName) {
        const found = [...store.conversations.values()].find((c) => c.name === conversationName);
        if (!found) throw new Error(`Conversation not found: ${conversationName}`);
        conversationId = found.id;
      } else {
        throw new Error('Conversation reference required');
      }
    }
    return enqueue({
      id,
      name: jobName,
      kind: 'chat',
      modelName,
      conversationId,
      options,
      createdAt: ts,
      updatedAt: ts,
      status: 'pending',
      deps: [],
    });
  };
  return { spec, invoke };
};

export const ollamaGetQueue: ToolFactory = () => {
  const spec = {
    name: 'ollama_get_queue',
    description: 'Snapshot of pending/running/completed jobs',
  } as const;
  const invoke = async () => snapshot();
  return { spec, invoke };
};

export const ollamaRemoveJob: ToolFactory = () => {
  const shape = { handle: z.union([z.string().uuid(), z.string()]) } as const;
  const Schema = z.object(shape);
  const spec = {
    name: 'ollama_remove_job',
    description: 'Remove a job by id or name if not running',
    inputSchema: Schema.shape,
  } as const;
  const invoke = async (raw: unknown) => {
    const { handle } = Schema.parse(raw);
    const before = store.jobs.length;
    store.jobs = store.jobs.filter(
      (j) => j.status === 'running' || (j.id !== handle && j.name !== handle),
    );
    return { removed: store.jobs.length < before };
  };
  return { spec, invoke };
};
