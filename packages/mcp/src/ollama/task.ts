import { z } from 'zod';

import { Either, left, right } from './either.js';

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

export type Message = z.infer<typeof MessageSchema>;
export type Task = z.infer<typeof TaskSchema>;

export const parseTask = (input: unknown): Either<z.ZodError<Task>, Task> => {
  const result = TaskSchema.safeParse(input);
  return result.success ? right(result.data) : left(result.error as z.ZodError<Task>);
};

export type { Either } from './either.js';
