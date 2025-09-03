// SPDX-License-Identifier: GPL-3.0-only
import express from "express";
import { Client } from "discord.js";
import { VoiceSession } from "./voice-session";
export declare function createVoiceService(token?: string): {
  app: express.Application;
  client: Client<boolean>;
  start: (port?: number) => Promise<unknown>;
  getSession: () => VoiceSession | null;
};
//# sourceMappingURL=index.d.ts.map
