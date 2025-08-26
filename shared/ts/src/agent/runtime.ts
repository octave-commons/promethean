export interface AgentRuntime {
    subscribe(topic: string, handler: (msg: any) => Promise<void>): Promise<void>;
    publish(topic: string, msg: any): Promise<void>;
}
