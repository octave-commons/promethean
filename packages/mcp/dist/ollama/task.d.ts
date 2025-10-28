import { z } from 'zod';
import { Either } from './either.js';
declare const MessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "user" | "system" | "tool" | "assistant";
    content: string;
}, {
    role: "user" | "system" | "tool" | "assistant";
    content: string;
}>;
export declare const TaskSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    id: z.ZodString;
    model: z.ZodString;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    stream: z.ZodOptional<z.ZodBoolean>;
} & {
    kind: z.ZodLiteral<"generate">;
    prompt: z.ZodString;
    suffix: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    id: string;
    kind: "generate";
    model: string;
    options?: Record<string, unknown> | undefined;
    stream?: boolean | undefined;
    suffix?: string | undefined;
}, {
    prompt: string;
    id: string;
    kind: "generate";
    model: string;
    options?: Record<string, unknown> | undefined;
    stream?: boolean | undefined;
    suffix?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    model: z.ZodString;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    stream: z.ZodOptional<z.ZodBoolean>;
} & {
    kind: z.ZodLiteral<"chat">;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "system" | "tool" | "assistant";
        content: string;
    }, {
        role: "user" | "system" | "tool" | "assistant";
        content: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    kind: "chat";
    model: string;
    messages: {
        role: "user" | "system" | "tool" | "assistant";
        content: string;
    }[];
    options?: Record<string, unknown> | undefined;
    stream?: boolean | undefined;
}, {
    id: string;
    kind: "chat";
    model: string;
    messages: {
        role: "user" | "system" | "tool" | "assistant";
        content: string;
    }[];
    options?: Record<string, unknown> | undefined;
    stream?: boolean | undefined;
}>]>;
export type Message = z.infer<typeof MessageSchema>;
export type Task = z.infer<typeof TaskSchema>;
export declare const parseTask: (input: unknown) => Either<z.ZodError<Task>, Task>;
export type { Either } from './either.js';
//# sourceMappingURL=task.d.ts.map