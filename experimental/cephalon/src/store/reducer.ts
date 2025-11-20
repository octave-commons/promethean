import type { Event } from "./events.js";

export type CephalonState = {
  voice: Record<string, { connected: boolean; channelId?: string }>;
};

export const initialState: CephalonState = {
  voice: {},
};

export function reducer(s: CephalonState, e: Event): CephalonState {
  switch (e.type) {
    case "VOICE/LEFT": {
      const next = { ...s.voice };
      next[e.guildId] = { connected: false };
      return { ...s, voice: next };
    }
    default:
      return s;
  }
}
