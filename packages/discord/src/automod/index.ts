export {
  createAutomod,
  containsSora,
  hasFuzzyCode,
  toAutomodMessage,
  DEFAULT_FUZZY_DISTANCE,
  DEFAULT_MINIMUM_EXAMPLES,
} from "./automod.js";

export type {
  AutomodController,
  AutomodMessage,
  AutomodOptions,
  AutomodSnapshot,
  ExampleType,
  LoggedMessage,
  ModerationDecision,
} from "./automod.js";
