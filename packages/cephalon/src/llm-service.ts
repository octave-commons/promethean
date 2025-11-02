// @ts-ignore import js module without types
import { BrokerClient } from "@promethean-os/legacy/brokerClient.js";
import { Message } from "ollama";
// Local minimal type copies to avoid cross-package type emission dependency
type Tool = {
  type: 'function';
  function: { name: string; description?: string; parameters: Record<string, any> };
};

type ToolCall = {
  id?: string;
  type: 'function';
  function: { name: string; arguments: string };
};

export type LLMClientOptions = {
  brokerUrl?: string;
  broker?: BrokerClient;
};

export type LLMRequest = {
  prompt: string;
  context: Message[];
  format?: object;
};

export class LLMService {
  broker: BrokerClient;
  #ready: Promise<void>;
  #pending: ((reply: any) => void)[] = [];
  #replyTopic: string;
  tools = new Map<string, { def: Tool; handler: (args: any) => any }>();

  constructor(options: LLMClientOptions = {}) {
    const brokerUrl =
      options.brokerUrl || process.env.BROKER_URL || "ws://localhost:7000";
    this.#replyTopic = `agent.llm.result`;
    this.broker =
      options.broker ||
      new BrokerClient({
        url: brokerUrl,
        id: `cephalon-llm`,
      });
    this.#ready = this.broker
      .connect()
      .then(() => {
        this.broker.subscribe(this.#replyTopic, async (event: any) => {
          const resolve = this.#pending.shift();
          if (resolve) {
            let reply = event.payload.reply;
            if (
              reply &&
              typeof reply === "object" &&
              Array.isArray(reply.tool_calls)
            ) {
              const call: ToolCall = reply.tool_calls[0];
              const tool = this.tools.get(call.function.name);
              if (tool) {
                try {
                  const args = JSON.parse(call.function.arguments || "{}");
                  reply = await tool.handler(args);
                } catch (err) {
                  console.error("Failed to execute tool", err);
                }
              }
            }
            resolve(reply);
          }
        });
      })
      .catch((err: unknown) => {
        console.error("Failed to connect to broker", err);
      });
  }

  async generate(opts: LLMRequest): Promise<any> {
    await this.#ready;
    return new Promise((resolve) => {
      this.#pending.push(resolve);
      this.broker.enqueue("llm.generate", {
        prompt: opts.prompt,
        context: opts.context,
        format: opts.format,
        tools: Array.from(this.tools.values()).map((t) => t.def),
        replyTopic: this.#replyTopic,
      });
    });
  }

  registerTool(def: Tool, handler: (args: any) => any) {
    this.tools.set(def.function.name, { def, handler });
  }
}
