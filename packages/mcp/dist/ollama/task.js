import { z } from 'zod';
import { left, right } from './either.js';
const MessageSchema = z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string().min(1),
});
const BaseTaskSchema = z.object({
    id: z.string().uuid(),
    model: z.string().min(1),
    options: z.record(z.unknown()).optional(),
    stream: z.boolean().optional(),
});
const GenerateTaskSchema = BaseTaskSchema.extend({
    kind: z.literal('generate'),
    prompt: z.string().min(1),
    suffix: z.string().optional(),
});
const ChatTaskSchema = BaseTaskSchema.extend({
    kind: z.literal('chat'),
    messages: z.array(MessageSchema).min(1),
});
export const TaskSchema = z.discriminatedUnion('kind', [GenerateTaskSchema, ChatTaskSchema]);
export const parseTask = (input) => {
    const result = TaskSchema.safeParse(input);
    return result.success ? right(result.data) : left(result.error);
};
//# sourceMappingURL=task.js.map