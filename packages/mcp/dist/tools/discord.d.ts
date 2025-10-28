import { z } from 'zod';
import type { Tool, ToolContext, ToolFactory } from '../core/types.js';
type RouteDescriptor = Readonly<{
    method: string;
    route: string;
}>;
type ListParams = Readonly<{
    readonly limit?: number;
    readonly before?: string;
    readonly after?: string;
    readonly around?: string;
}>;
type SendArgs = Readonly<[string, string, string, string, unknown, typeof fetch]>;
type ProxyLike = Readonly<{
    routeForPostMessage: (spaceUrn: string) => RouteDescriptor;
    routeForListMessages: (spaceUrn: string, params?: ListParams) => RouteDescriptor;
    send: (...args: SendArgs) => Promise<unknown>;
}>;
type ProxyFactory = () => ProxyLike;
declare const MessagePayload: z.ZodEffects<z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    embeds: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    allowed_mentions: z.ZodOptional<z.ZodUnknown>;
    tts: z.ZodOptional<z.ZodBoolean>;
    components: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    content?: string | undefined;
    components?: unknown[] | undefined;
    embeds?: unknown[] | undefined;
    allowed_mentions?: unknown;
    tts?: boolean | undefined;
    attachments?: unknown[] | undefined;
}, {
    content?: string | undefined;
    components?: unknown[] | undefined;
    embeds?: unknown[] | undefined;
    allowed_mentions?: unknown;
    tts?: boolean | undefined;
    attachments?: unknown[] | undefined;
}>, {
    content?: string | undefined;
    components?: unknown[] | undefined;
    embeds?: unknown[] | undefined;
    allowed_mentions?: unknown;
    tts?: boolean | undefined;
    attachments?: unknown[] | undefined;
}, {
    content?: string | undefined;
    components?: unknown[] | undefined;
    embeds?: unknown[] | undefined;
    allowed_mentions?: unknown;
    tts?: boolean | undefined;
    attachments?: unknown[] | undefined;
}>;
declare const ListSchema: z.ZodObject<{
    readonly provider: z.ZodOptional<z.ZodString>;
    readonly tenant: z.ZodOptional<z.ZodString>;
    readonly spaceUrn: z.ZodOptional<z.ZodString>;
    readonly limit: z.ZodOptional<z.ZodNumber>;
    readonly before: z.ZodOptional<z.ZodString>;
    readonly after: z.ZodOptional<z.ZodString>;
    readonly around: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider?: string | undefined;
    before?: string | undefined;
    after?: string | undefined;
    tenant?: string | undefined;
    spaceUrn?: string | undefined;
    limit?: number | undefined;
    around?: string | undefined;
}, {
    provider?: string | undefined;
    before?: string | undefined;
    after?: string | undefined;
    tenant?: string | undefined;
    spaceUrn?: string | undefined;
    limit?: number | undefined;
    around?: string | undefined;
}>;
export declare const createDiscordSendMessageTool: (proxyFactory?: ProxyFactory) => ToolFactory;
export declare const createDiscordListMessagesTool: (proxyFactory?: ProxyFactory) => ToolFactory;
export declare const discordSendMessage: ToolFactory;
export declare const discordListMessages: ToolFactory;
export declare const discordTools: (ctx: ToolContext, proxyFactory?: ProxyFactory) => Readonly<{
    sendMessage: Tool;
    listMessages: Tool;
}>;
export { MessagePayload, ListSchema };
//# sourceMappingURL=discord.d.ts.map