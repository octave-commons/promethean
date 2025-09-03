// SPDX-License-Identifier: GPL-3.0-only
import * as discord from "discord.js";
import type { VoiceStateChangeHandler } from "../bot.js";

export type VoiceAdapter = {
  leaveGuild: (guildId: string) => Promise<boolean>;
};

// A tiny adapter around the current Bot voice session. This keeps the action decoupled.
export function makeDiscordVoiceAdapter(params: {
  client: discord.Client;
  getCurrentVoiceSession: () => any | undefined;
  setCurrentVoiceSession: (v: any | undefined) => void;
  getVoiceStateHandler: () => VoiceStateChangeHandler | undefined;
  setVoiceStateHandler: (h: VoiceStateChangeHandler) => void;
}): VoiceAdapter {
  const {
    client,
    getCurrentVoiceSession,
    setCurrentVoiceSession,
    getVoiceStateHandler,
    setVoiceStateHandler,
  } = params;

  return {
    async leaveGuild(_guildId: string) {
      const session = getCurrentVoiceSession();
      if (!session) return false;

      // Stop session playback/recording
      try {
        session.stop?.();
      } catch {}

      // Rebind a guard voice state handler to prevent late events
      const currentHandler = getVoiceStateHandler();
      if (currentHandler) {
        client.off(discord.Events.VoiceStateUpdate, currentHandler);
      }
      const guard: VoiceStateChangeHandler = (
        _1: discord.VoiceState,
        _2: discord.VoiceState,
      ) => {
        throw new Error("Voice channel left; voice state update after leave");
      };
      client.on(discord.Events.VoiceStateUpdate, guard);
      setVoiceStateHandler(guard);

      setCurrentVoiceSession(undefined);
      return true;
    },
  };
}
