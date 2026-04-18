import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { DEFAULT_POLICY_CONFIG } from "../defaults/index.js";
import { createPolicyEngine, type PolicyEngine } from "../engine/index.js";
import type { PolicyConfig } from "../schema.js";
import { type DeepPartial, validatePolicyConfig } from "./validate.js";

const POLICY_CONFIG_FILE_ENV = "PROXY_POLICY_CONFIG_FILE";

function mergeDeep<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined
      && sourceValue !== null
      && typeof sourceValue === "object"
      && !Array.isArray(sourceValue)
      && targetValue !== undefined
      && targetValue !== null
      && typeof targetValue === "object"
      && !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key as string] = mergeDeep(
        targetValue as object,
        sourceValue as DeepPartial<object>,
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key as string] = sourceValue;
    }
  }

  return result;
}

export async function loadPolicyConfig(configPath?: string): Promise<PolicyConfig> {
  const filePath = configPath ?? process.env[POLICY_CONFIG_FILE_ENV];
  if (!filePath) {
    return DEFAULT_POLICY_CONFIG;
  }

  const resolvedPath = resolve(filePath);
  try {
    await access(resolvedPath);
  } catch {
    return DEFAULT_POLICY_CONFIG;
  }

  const content = await readFile(resolvedPath, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Policy config file ${resolvedPath} contains invalid JSON: ${error}`);
  }

  const validated = validatePolicyConfig(parsed, resolvedPath);
  return mergeDeep(DEFAULT_POLICY_CONFIG, validated);
}

export async function initializePolicyEngine(configPath?: string): Promise<PolicyEngine> {
  const config = await loadPolicyConfig(configPath);
  return createPolicyEngine(config);
}

export { DEFAULT_POLICY_CONFIG } from "../defaults/index.js";
