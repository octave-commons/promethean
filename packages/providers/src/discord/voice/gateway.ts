// Discord voice gateway stub
export async function connectVoiceGateway(tenant: string, guildId: string, channelId: string) {
    // TODO: implement WS handshake with Discord voice server
    return { tenant, guildId, channelId, connected: true };
}
