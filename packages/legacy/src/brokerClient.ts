export interface LegacyBrokerClient {
  publish: (topic: string, message: unknown) => Promise<void>;
  subscribe: (topic: string, handler: (message: unknown) => void) => Promise<() => void>;
}

export const createLegacyBrokerClient = (): LegacyBrokerClient => {
  return {
    async publish() {
      // no-op legacy stub
    },
    async subscribe(_topic, _handler) {
      // returns no-op unsubscribe
      return async () => {};
    },
  };
};
