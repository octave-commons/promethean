export type McpTransportConfig =
  | { readonly kind: "http-stream"; readonly url: string }
  | { readonly kind: "websocket"; readonly url: string }
  | {
      readonly kind: "process";
      readonly command: string;
      readonly args?: readonly string[];
    }
  | { readonly kind: string; readonly [key: string]: unknown };

export type McpMountPayload = {
  readonly serverId: string;
  readonly transport: McpTransportConfig;
  readonly exposeTools?: boolean;
  readonly exposeResources?: readonly string[];
  readonly labels?: Record<string, string>;
};

export type McpAnnouncePayload = {
  readonly serverId: string;
  readonly tools?: readonly unknown[];
  readonly resources?: readonly unknown[];
};
