// SPDX-License-Identifier: GPL-3.0-only
import * as discord from "discord.js";

type Interaction = discord.ChatInputCommandInteraction<"cached">;

export function interaction(
  commandConfig: Omit<
    discord.RESTPostAPIChatInputApplicationCommandsJSONBody,
    "name"
  >,
) {
  return function (target: any, key: string, describer: PropertyDescriptor) {
    const ctor = target.constructor;
    const originalMethod = describer.value;
    const name = key
      .replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)
      .toLowerCase();
    ctor.interactions.set(name, { name, ...commandConfig });
    ctor.handlers.set(name, (bot: any, interaction: Interaction) =>
      originalMethod.call(bot, interaction),
    );
    return describer;
  };
}

export type { Interaction };
