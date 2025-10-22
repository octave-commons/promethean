export type AgentRuntime = {
    subscribe<Message>(
        topic: string,
        handler: (msg: Message) => Promise<void>,
    ): Promise<void>;
    publish<Message>(topic: string, msg: Message): Promise<void>;
};
