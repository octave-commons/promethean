import test from 'ava';
import { Guild, User } from 'discord.js';
import { VoiceSession } from '../src/voice-session.ts';

test('recording state toggles with start/stop', async (t) => {
    const guild = new Guild('1');
    const vs = new VoiceSession({ guild, voiceChannelId: '10' });
    const user = new User('7', 'bob');
    await vs.addSpeaker(user);
    await vs.startSpeakerRecord(user);
    t.true(vs.speakers.get('7')?.isRecording);
    await vs.stopSpeakerRecord(user);
    t.false(vs.speakers.get('7')?.isRecording);
});

test('transcription state toggles with start/stop', async (t) => {
    const guild = new Guild('2');
    const vs = new VoiceSession({ guild, voiceChannelId: '11' });
    const user = new User('8', 'alice');
    await vs.addSpeaker(user);
    await vs.startSpeakerTranscribe(user, false);
    t.true(vs.speakers.get('8')?.isTranscribing);
    await vs.stopSpeakerTranscribe(user);
    t.false(vs.speakers.get('8')?.isTranscribing);
});
