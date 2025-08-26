export type Event =
    | { type: 'VOICE/LEAVE_REQUESTED'; guildId: string; channelId?: string; by: string }
    | { type: 'VOICE/LEFT'; guildId: string }
    | { type: 'VOICE/JOIN_REQUESTED'; guildId: string; voiceChannelId: string; by: string; textChannelId?: string }
    | { type: 'VOICE/JOINED'; guildId: string; voiceChannelId: string }
    | { type: 'VOICE/RECORD_START_REQUESTED'; guildId: string; userId: string; by: string }
    | { type: 'VOICE/RECORD_STOP_REQUESTED'; guildId: string; userId: string; by: string }
    | { type: 'VOICE/TRANSCRIBE_START_REQUESTED'; guildId: string; userId: string; by: string; log?: boolean }
    | { type: 'VOICE/TTS_REQUESTED'; guildId: string; by: string; message: string }
    | { type: 'PING/TRIGGERED'; by: string }
    | { type: 'PING/PONG'; by: string; message: string };
