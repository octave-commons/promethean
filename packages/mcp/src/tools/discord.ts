import { z } from "zod";
import { DiscordRestProxy } from "@promethean/discord";

import type {
  Tool,
  ToolContext,
  ToolFactory,
  ToolSpec,
} from "../core/types.js";

const RestResponseSchema = z
  .object({
    ok: z.boolean(),
    status: z.number(),
    body: z.unknown().optional(),
    bucket: z.string().optional(),
    retry_after_ms: z.number().optional(),
  })
  .readonly();

type RouteDescriptor = Readonly<{ method: string; route: string }>;
type ListParams = Readonly<{
  readonly limit?: number;
  readonly before?: string;
  readonly after?: string;
  readonly around?: string;
}>;

type SendArgs = Readonly<
  [string, string, string, string, unknown, typeof fetch]
>;

type ProxyLike = Readonly<{
  routeForPostMessage: (spaceUrn: string) => RouteDescriptor;
  routeForListMessages: (
    spaceUrn: string,
    params?: ListParams,
  ) => RouteDescriptor;
  send: (...args: SendArgs) => Promise<unknown>;
}>;

type ProxyFactory = () => ProxyLike;

const defaultProxyFactory: ProxyFactory = () =>
  new (DiscordRestProxy as unknown as new () => DiscordRestProxy)() as unknown as ProxyLike;

const resolveProvider = (
  explicit: string | undefined,
  env: Readonly<Record<string, string | undefined>>,
): string => explicit ?? env.DISCORD_PROVIDER ?? "discord";

const requireValue = (value: string | undefined, message: string): string =>
  z.string({ required_error: message }).min(1, message).parse(value);

const resolveTenant = (
  explicit: string | undefined,
  env: Readonly<Record<string, string | undefined>>,
): string => {
  const tenant =
    explicit ??
    env.DISCORD_TENANT ??
    env.DISCORD_GUILD ??
    env.DISCORD_SPACE_TENANT;
  return requireValue(
    tenant,
    "discord tools require a tenant; pass `tenant` or set DISCORD_TENANT / DISCORD_GUILD",
  );
};

const resolveSpaceUrn = (
  explicit: string | undefined,
  env: Readonly<Record<string, string | undefined>>,
): string => {
  const urn = explicit ?? env.DISCORD_SPACE_URN ?? env.DISCORD_CHANNEL_URN;
  return requireValue(
    urn,
    "discord tools require a spaceUrn; pass `spaceUrn` or set DISCORD_SPACE_URN",
  );
};

const mapResult = (
  input: unknown,
): Readonly<{
  ok: boolean;
  status: number;
  body?: unknown;
  bucket?: string;
  retryAfterMs: number | null;
}> => {
  const safe = RestResponseSchema.parse(input);
  return {
    ok: safe.ok,
    status: safe.status,
    ...(typeof safe.body !== "undefined" ? { body: safe.body } : {}),
    ...(safe.bucket ? { bucket: safe.bucket } : {}),
    retryAfterMs:
      typeof safe.retry_after_ms === "number" ? safe.retry_after_ms : null,
  };
};

const MessagePayload = z
  .object({
    content: z.string().max(2000).optional(),
    embeds: z.array(z.unknown()).optional(),
    allowed_mentions: z.unknown().optional(),
    tts: z.boolean().optional(),
    components: z.array(z.unknown()).optional(),
    attachments: z.array(z.unknown()).optional(),
  })
  .refine(
    (value) => Boolean(value.content) || Boolean(value.embeds?.length),
    "message content or embeds are required",
  );

const createSendMessageTool = (
  ctx: ToolContext,
  proxyFactory: ProxyFactory,
): Tool => {
  const shape = {
    provider: z.string().optional(),
    tenant: z.string().optional(),
    spaceUrn: z.string().optional(),
    message: MessagePayload,
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: "discord.send-message",
    description:
      "Send a message to a Discord channel. Provide content or embeds and the Discord space URN.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;

  const proxy = proxyFactory();

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const provider = resolveProvider(args.provider, ctx.env);
    const tenant = resolveTenant(args.tenant, ctx.env);
    const spaceUrn = resolveSpaceUrn(args.spaceUrn, ctx.env);
    const { method, route } = proxy.routeForPostMessage(spaceUrn);
    const res = await proxy.send(
      provider,
      tenant,
      method,
      route,
      args.message,
      ctx.fetch,
    );
    return mapResult(res);
  };

  return { spec, invoke };
};

const ListSchemaShape = {
  provider: z.string().optional(),
  tenant: z.string().optional(),
  spaceUrn: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  around: z.string().optional(),
} as const;

const ListSchema = z.object(ListSchemaShape);

const createListMessagesTool = (
  ctx: ToolContext,
  proxyFactory: ProxyFactory,
): Tool => {
  const spec = {
    name: "discord.list-messages",
    description:
      "List recent messages from a Discord channel with optional pagination parameters.",
    inputSchema: ListSchemaShape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;

  const proxy = proxyFactory();

  const invoke = async (raw: unknown) => {
    const args = ListSchema.parse(raw);
    const provider = resolveProvider(args.provider, ctx.env);
    const tenant = resolveTenant(args.tenant, ctx.env);
    const spaceUrn = resolveSpaceUrn(args.spaceUrn, ctx.env);
    const params: ListParams = {
      ...(typeof args.limit === "number" ? { limit: args.limit } : {}),
      ...(args.before ? { before: args.before } : {}),
      ...(args.after ? { after: args.after } : {}),
      ...(args.around ? { around: args.around } : {}),
    };

    const { method, route } = proxy.routeForListMessages(spaceUrn, params);
    const res = await proxy.send(
      provider,
      tenant,
      method,
      route,
      undefined,
      ctx.fetch,
    );
    return mapResult(res);
  };

  return { spec, invoke };
};

export const createDiscordSendMessageTool = (
  proxyFactory: ProxyFactory = defaultProxyFactory,
): ToolFactory => {
  return (ctx) => createSendMessageTool(ctx, proxyFactory);
};

export const createDiscordListMessagesTool = (
  proxyFactory: ProxyFactory = defaultProxyFactory,
): ToolFactory => {
  return (ctx) => createListMessagesTool(ctx, proxyFactory);
};

export const discordSendMessage: ToolFactory = createDiscordSendMessageTool();
export const discordListMessages: ToolFactory = createDiscordListMessagesTool();

export const discordTools = (
  ctx: ToolContext,
  proxyFactory: ProxyFactory = defaultProxyFactory,
): Readonly<{ sendMessage: Tool; listMessages: Tool }> => ({
  sendMessage: createSendMessageTool(ctx, proxyFactory),
  listMessages: createListMessagesTool(ctx, proxyFactory),
});
