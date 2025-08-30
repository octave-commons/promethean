import type { Bot } from "../bot.js";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import * as leaveVoice from "../commands/leave-voice.js";
import * as ping from "../commands/ping.js";
import * as joinVoice from "../commands/join-voice.js";
import * as beginRecording from "../commands/begin-recording.js";
import * as stopRecording from "../commands/stop-recording.js";
import * as beginTranscribing from "../commands/begin-transcribing.js";
import * as tts from "../commands/tts.js";
import * as startDialog from "../commands/start-dialog.js";
import * as setCaptureChannel from "../commands/set-capture-channel.js";
import * as setDesktopChannel from "../commands/set-desktop-channel.js";

type CommandModule = {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  default: (interaction: any, ctx: any) => Promise<void>;
};

export function registerNewStyleCommands(BotCtor: typeof Bot) {
  const mods: CommandModule[] = [
    leaveVoice as any as CommandModule,
    ping as any as CommandModule,
    joinVoice as any as CommandModule,
    beginRecording as any as CommandModule,
    stopRecording as any as CommandModule,
    beginTranscribing as any as CommandModule,
    tts as any as CommandModule,
    startDialog as any as CommandModule,
    setCaptureChannel as any as CommandModule,
    setDesktopChannel as any as CommandModule,
  ];

  for (const m of mods) {
    const name = m.data.name;
    BotCtor.interactions.set(name, m.data);
    BotCtor.handlers.set(name, async (bot: Bot, interaction: any) => {
      const ctx = { bot };
      await m.default(interaction, ctx);
    });
  }
}
