export type ACLCtx = { agent?: string; scopes?: string[] };
export type ACLChecker = (
  topic: string,
  action: "publish" | "subscribe",
  ctx: ACLCtx,
) => boolean | Promise<boolean>;
