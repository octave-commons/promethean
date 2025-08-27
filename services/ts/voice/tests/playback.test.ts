import test from 'ava';
import { Guild } from 'discord.js';
import { PassThrough } from 'stream';
import { createVoiceService } from '../src/index.ts';

if (process.env.SKIP_NETWORK_TESTS === '1') {
    test('voice playback network tests skipped in sandbox', (t) => t.pass());
} else {
    test('speak endpoint plays voice', async (t) => {
        const service = createVoiceService('tok');
        // stub guild and user fetching
        service.client.guilds.fetch = async (id: string) => new Guild(id);
        service.client.users.fetch = async (id: string) => ({ id, username: 'bob' }) as any;

        const server: any = await service.start(0);
        const port = (server.address() as any).port;

        await fetch(`http://localhost:${port}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: '1', channelId: '10' }),
        });

        const session = service.getSession();
        if (!session) {
            t.fail('session not created');
            return;
        }

        session.voiceSynth.generateAndUpsampleVoice = async () => {
            const stream = new PassThrough();
            process.nextTick(() => {
                stream.end();
                session.emit('audioPlayerStop', {} as any);
            });
            return { stream, cleanup: () => {} };
        };

        const res = await fetch(`http://localhost:${port}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'hello' }),
        });

        t.true(res.ok);
        const data = await res.json();
        t.is(data.status, 'ok');

        server.close();
    });
}
