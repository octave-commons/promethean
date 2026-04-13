import { DEFAULT_FALLBACK_BEHAVIOR, DEFAULT_PLAN_WEIGHTS, type PolicyConfig } from "../schema.js";
import { buildFreeBlockedConstraints, createGptModelRoutingRules, GPT_FREE_BLOCKED_MODELS } from "./gpt.js";

export {
  buildFreeBlockedConstraints,
  createGptModelRoutingRules,
  CLAUDE_OPUS_46_PROVIDER_ORDER,
  DEFAULT_GPT_PROVIDER_ORDER,
  GPT_FREE_BLOCKED_MODELS,
  GPT_FREE_BLOCKED_MODEL_PATTERN,
  GPT_OSS_PROVIDER_ORDER,
} from "./gpt.js";

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  version: "1.0",

  modelRouting: {
    rules: createGptModelRoutingRules(),
    defaultAccountOrdering: { kind: "prefer_free" },
  },

  strategySelection: {
    rules: [],
    defaultOrder: [
      "local_ollama_chat",
      "ollama_chat",
      "openai_responses",
      "openai_chat_completions",
      "responses",
      "messages",
      "chat_completions",
    ],
  },

  fallback: DEFAULT_FALLBACK_BEHAVIOR,

  accountPreferences: {
    planWeights: DEFAULT_PLAN_WEIGHTS,
    modelConstraints: buildFreeBlockedConstraints(GPT_FREE_BLOCKED_MODELS),
  },
};
