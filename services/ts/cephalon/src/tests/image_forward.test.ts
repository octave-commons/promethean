import test from 'ava';
import { Bot } from '../../src/bot.js';

test('forwards image attachments to capture channel', async (t) => {
	let sent: any = null;
	const bot = new Bot({ token: '', applicationId: '' });
	bot.captureChannel = {
		send: async (data: any) => {
			sent = data;
		},
	} as any;
	const attachments = new Map([
		[
			'1',
			{
				url: 'https://example.com/img.png',
				name: 'img.png',
				contentType: 'image/png',
			},
		],
		[
			'2',
			{
				url: 'https://example.com/file.txt',
				name: 'file.txt',
				contentType: 'text/plain',
			},
		],
	]);
	const message: any = { attachments, author: { bot: false } };
	await bot.forwardAttachments(message);
	t.truthy(sent);
	t.is(sent.files.length, 1);
	t.deepEqual(sent.files[0], {
		attachment: 'https://example.com/img.png',
		name: 'img.png',
	});
});
