import 'source-map-support/register.js';
import { AGENT_NAME } from '../../../../shared/js/env.js';
import { HeartbeatClient } from '../../../../shared/js/heartbeat/index.js';
import { BrokerClient } from '../../../../shared/js/brokerClient.js';
import { AIAgent } from './agent/index.js';
import { ContextManager } from './contextManager.js';
import { LLMService } from './llm-service.js';
import { initMessageThrottler } from './messageThrottler.js';

async function main() {
	console.log('Starting', AGENT_NAME, 'Cephalon worker');
	const context = new ContextManager();
	const bot = { context };
	const agent = new AIAgent({ historyLimit: 20, bot, context, llm: new LLMService() });
	const client: BrokerClient = await initMessageThrottler(agent, process.env.BROKER_URL);
	client.onTaskReceived(async (task: any) => {
		if (task.payload?.type === 'discord-message') {
			const reply = await agent.generateTextResponse(task.payload.content, {});
			client.publish('discord-outbound', {
				channelId: task.payload.channelId,
				content: reply,
			});
		} else if (task.payload?.type === 'discord-interaction') {
			const name = task.payload.interaction?.commandName || 'interaction';
			const reply = await agent.generateTextResponse(`Handled ${name}`, {});
			client.publish('discord-outbound', {
				channelId: task.payload.interaction?.channelId,
				content: reply,
			});
		}
		client.ack(task.id);
	});
	client.ready('cephalon');
	const hb = new HeartbeatClient();
	try {
		await hb.sendOnce();
	} catch (err) {
		console.error('failed to register heartbeat', err);
		process.exit(1);
	}
	hb.start();
	console.log(`Cephalon worker started for ${AGENT_NAME}`);
}

if (process.env.NODE_ENV !== 'test') {
	main();
}
