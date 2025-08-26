import test from "ava";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dynamic imports for broker server and client
// @ts-ignore dynamic import of JS modules
const brokerModule = await import(
	path.resolve(__dirname, "../../../../js/broker/index.js")
);
const { start: startBroker, stop: stopBroker } = brokerModule;
// @ts-ignore dynamic import of JS modules
const clientModule = await import("@shared/js/brokerClient.js");
const { BrokerClient } = clientModule;

const { LLMService } = await import("../llm-service.js");

test("LLMService routes tool calls through broker", async (t) => {
	process.env.NO_SCREENSHOT = "1";
	const broker = await startBroker(0);
	const port = broker.address().port;
	let received: any = null;
	const worker = new BrokerClient({
		url: `ws://127.0.0.1:${port}`,
		id: "llm-worker",
	});
	await worker.connect();
	worker.onTaskReceived(async (task: any) => {
		received = task.payload;
		await worker.ack(task.id);
		await worker.publish(task.payload.replyTopic, {
			reply: {
				tool_calls: [
					{
						type: "function",
						function: {
							name: "add",
							arguments: JSON.stringify({ a: 2, b: 3 }),
						},
					},
				],
			},
			taskId: task.id,
		});
		await worker.ready(task.queue);
	});
	await worker.ready("llm.generate");

	const llm = new LLMService({ brokerUrl: `ws://127.0.0.1:${port}` });
	llm.registerTool(
		{
			type: "function",
			function: {
				name: "add",
				description: "sum two numbers",
				parameters: {
					type: "object",
					properties: { a: { type: "number" }, b: { type: "number" } },
				},
			},
		},
		({ a, b }: any) => a + b,
	);

	const result = await llm.generate({ prompt: "add", context: [] });
	t.is(result, 5);
	t.truthy(received.tools[0]);

	worker.socket?.close();
	await stopBroker(broker);
});
