export type MessagingInstrumentation = {
  onConnect?(info: { url: string }): void;
  onClose?(info: { reason?: Error | undefined }): void;
  onRetry?(info: { attempt: number; delayMs: number; error: Error }): void;
  onPublish?(info: { exchange: string; routingKey: string; topic: string }): void;
  onDelivery?(info: { queue: string; routingKey: string; topic?: string }): void;
  onRpcRequest?(info: { queue: string; correlationId: string }): void;
  onRpcResponse?(info: { queue: string; correlationId: string; success: boolean }): void;
  onError?(info: { stage: string; error: Error }): void;
};

export const createNoopInstrumentation = (): MessagingInstrumentation => ({
  onConnect() {
    // noop
  },
  onClose() {
    // noop
  },
  onRetry() {
    // noop
  },
  onPublish() {
    // noop
  },
  onDelivery() {
    // noop
  },
  onRpcRequest() {
    // noop
  },
  onRpcResponse() {
    // noop
  },
  onError() {
    // noop
  },
});
