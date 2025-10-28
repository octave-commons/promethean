import { z } from 'zod';
import { randomUUID } from 'node:crypto';
const now = () => Date.now();
const store = {
    templates: new Map(),
    conversations: new Map(),
    jobs: [],
};
export const __resetOllamaForTests = () => {
    store.templates.clear();
    store.conversations.clear();
    store.jobs.splice(0, store.jobs.length);
};
const snapshot = () => {
    const pending = store.jobs.filter((j) => j.status === 'pending');
    const inProgress = store.jobs.filter((j) => j.status === 'running');
    const completed = store.jobs.filter((j) => j.status === 'succeeded' || j.status === 'failed' || j.status === 'canceled');
    return { pending, inProgress, completed };
};
const enqueue = (job) => {
    const pending = snapshot().pending.length;
    store.jobs = [...store.jobs, job];
    return { jobId: job.id, jobName: job.name, queuePosition: pending + 1 };
};
export const ollamaPull = () => {
    const shape = { modelName: z.string().min(1) };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_pull',
        description: 'Queue a model pull (no-op executor in MVP)',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
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
export const ollamaListModels = () => {
    const spec = {
        name: 'ollama_list_models',
        description: 'List models (MVP returns empty; integrate Ollama HTTP later)',
    };
    const invoke = async () => ({ models: [] });
    return { spec, invoke };
};
export const ollamaListTemplates = () => {
    const spec = { name: 'ollama_list_templates', description: 'List registered templates' };
    const invoke = async () => ({
        templates: [...store.templates.values()].map((t) => ({ name: t.name, version: t.version })),
    });
    return { spec, invoke };
};
export const ollamaCreateTemplate = () => {
    const shape = { templateName: z.string().min(1), src: z.string().min(1) };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_create_template',
        description: 'Create or update a template (s-expr text stored verbatim)',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
        const { templateName, src } = Schema.parse(raw);
        const prev = store.templates.get(templateName);
        const version = prev ? prev.version + 1 : 1;
        const rec = {
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
export const ollamaEnqueueJobFromTemplate = () => {
    const shape = {
        jobName: z.string().optional(),
        templateName: z.string().min(1),
        args: z.array(z.any()).optional(),
    };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_enqueue_job_from_template',
        description: 'Queue a job that will execute a named template',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
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
export const ollamaStartConversation = () => {
    const shape = {
        conversationName: z.string().optional(),
        initialMessage: z.string().optional(),
        systemPrompt: z.string().optional(),
    };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_start_conversation',
        description: 'Create a conversation; optionally seeds initial user message',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
        const { conversationName, initialMessage, systemPrompt } = Schema.parse(raw);
        const id = randomUUID();
        const ts = now();
        const emptyMsgs = [];
        const base = {
            id,
            name: conversationName,
            systemPrompt,
            messages: emptyMsgs,
            createdAt: ts,
            updatedAt: ts,
        };
        const seeded = (() => {
            if (typeof initialMessage !== 'string' || initialMessage.length === 0) {
                return base;
            }
            const userMessage = { role: 'user', content: initialMessage };
            const messages = [...base.messages, userMessage];
            return {
                ...base,
                messages,
                updatedAt: now(),
            };
        })();
        store.conversations.set(id, seeded);
        return { conversationId: id, conversationName, jobId: undefined };
    };
    return { spec, invoke };
};
export const ollamaEnqueueGenerateJob = () => {
    const shape = {
        jobName: z.string().optional(),
        modelName: z.string().min(1),
        prompt: z.string().min(1),
        suffix: z.string().optional(),
        options: z.record(z.any()).optional(),
    };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_enqueue_generate_job',
        description: 'Queue a text generation job (no execution in MVP)',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
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
export const ollamaEnqueueChatCompletion = () => {
    const shape = {
        jobName: z.string().optional(),
        modelName: z.string().min(1),
        ref: z.union([
            z.object({
                conversationId: z.string().uuid().optional(),
                conversationName: z.string().optional(),
            }),
            z.array(z.object({ role: z.enum(['system', 'user', 'assistant', 'tool']), content: z.string() })),
        ]),
        options: z.record(z.any()).optional(),
    };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_enqueue_chat_completion',
        description: 'Queue a chat completion against a conversation or raw messages',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
        const { jobName, modelName, ref, options } = Schema.parse(raw);
        const id = randomUUID();
        const ts = now();
        let conversationId;
        if (Array.isArray(ref)) {
            // create ephemeral conversation
            conversationId = randomUUID();
            const rawMessages = ref;
            const typedMessages = rawMessages.map((m) => ({ role: m.role, content: m.content }));
            const conv = {
                id: conversationId,
                messages: typedMessages,
                createdAt: ts,
                updatedAt: ts,
            };
            store.conversations.set(conversationId, conv);
        }
        else {
            const { conversationId: cid, conversationName } = ref;
            if (cid && store.conversations.has(cid)) {
                conversationId = cid;
            }
            else if (conversationName) {
                const found = [...store.conversations.values()].find((c) => c.name === conversationName);
                if (!found)
                    throw new Error(`Conversation not found: ${conversationName}`);
                conversationId = found.id;
            }
            else {
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
export const ollamaGetQueue = () => {
    const spec = {
        name: 'ollama_get_queue',
        description: 'Snapshot of pending/running/completed jobs',
    };
    const invoke = async () => snapshot();
    return { spec, invoke };
};
export const ollamaRemoveJob = () => {
    const shape = { handle: z.union([z.string().uuid(), z.string()]) };
    const Schema = z.object(shape);
    const spec = {
        name: 'ollama_remove_job',
        description: 'Remove a job by id or name if not running',
        inputSchema: Schema.shape,
    };
    const invoke = async (raw) => {
        const { handle } = Schema.parse(raw);
        const before = store.jobs.length;
        store.jobs = store.jobs.filter((j) => j.status === 'running' || (j.id !== handle && j.name !== handle));
        return { removed: store.jobs.length < before };
    };
    return { spec, invoke };
};
//# sourceMappingURL=ollama.js.map