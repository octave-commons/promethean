import test, { type ExecutionContext } from 'ava';
import { Bot } from '../src/bot.js';

class TestBot extends Bot {
	constructor() {
		super({ token: 'tok', applicationId: 'app' });
		// stub channel fetch
		this.client.channels.fetch = async (id: string) =>
			({
				id,
				isTextBased: () => true,
				send: async (payload: any) => {
					(this as any).lastPayload = payload;
				},
				toString: () => '#chan',
			}) as any;
	}

	lastReply?: string;
}

test('setScreenshotChannel sets id and logScreenshot sends', async (t: ExecutionContext) => {
	const bot = new TestBot();
	const interaction: any = {
		options: {
			getChannel: () => ({ id: '123', isTextBased: () => true, toString: () => '#chan' }),
		},
		reply: async (msg: string) => {
			bot.lastReply = msg;
		},
	};
	await bot.setScreenshotChannel(interaction);
	t.is(bot.screenshotChannelId, '123');
	await bot.logScreenshot(Buffer.from('data'));
	t.truthy((bot as any).lastPayload);
});
