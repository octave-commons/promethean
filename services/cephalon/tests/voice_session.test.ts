import test from 'ava';
import { Guild, User } from 'discord.js';
import { lastJoinOptions } from '@discordjs/voice';
import { VoiceSession } from '../src/voice-session.ts';

function makeGuild(id:string) {
  return new Guild(id);
}

test('start joins voice channel', t => {
  const guild = makeGuild('123');
  const vs = new VoiceSession({ voiceChannelId: '10', guild, bot: {} as any });
  vs.start();
  t.truthy(vs.connection);
  t.is(lastJoinOptions.guildId, '123');
  t.is(lastJoinOptions.channelId, '10');
});

test('addSpeaker registers user', async t => {
  const guild = makeGuild('1');
  const vs = new VoiceSession({ voiceChannelId: '99', guild, bot: {} as any });
  const user = new User('7', 'bob');
  await vs.addSpeaker(user);
  t.true(vs.speakers.has('7'));
});
