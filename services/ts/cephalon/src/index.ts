import 'source-map-support/register.js';
import { Bot } from './bot';
import { AGENT_NAME } from '../../../../shared/js/env.js';
import { HeartbeatClient } from '../../../../shared/js/heartbeat/index.js';

async function main() {
	  console.log('Starting', AGENT_NAME, 'Cephalon');
	  const bot = new Bot({
		    token: process.env.DISCORD_TOKEN as string,
		    applicationId: process.env.DISCORD_CLIENT_USER_ID as string,
	  });
	  const hb = new HeartbeatClient({
		    onHeartbeat: (heartbeat:any) => {
            console.log(heartbeat)
            // const { cpu }: { cpu: number } = heartbeat
			      // const delay = Math.min(1000, 100 + Math.round(cpu));
            const delay = 1000; // fix the heartbaet client to provide health data.
			      bot.agent.updateTickInterval(delay);
		    },
	  });
	  try {
		    const data = await hb.sendOnce();
		    hb.onHeartbeat?.(data);
	  } catch (err) {
		    console.error('failed to register heartbeat', err);
		    process.exit(1);
	  }
	  hb.start();
	  bot.start();
	  console.log(`Cephalon started for ${AGENT_NAME}`);
}

if (process.env.NODE_ENV !== 'test') {
	  main();
}
