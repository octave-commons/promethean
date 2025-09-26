import fs from "fs";
import path from "path";
import yaml from "yaml";

let config;

function loadConfig() {
  if (!config) {
    try {
      const file = fs.readFileSync(
        path.resolve(
          path.dirname(new URL(import.meta.url).pathname),
          "../permissions.yaml",
        ),
        "utf8",
      );
      config = yaml.parse(file) || {};
    } catch (err) {
      if (err && err.code !== "ENOENT") throw err;
      config = {};
    }
  }
  return config;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function checkPermission(agent, action) {
  const cfg = loadConfig();
  const beta = cfg.beta ?? 1.0;
  const def = cfg.default || {};
  const agentCfg = (cfg.agents || {})[agent] || {};
  const weights = agentCfg.weights || def.weights || {};
  const threshold = agentCfg.threshold ?? def.threshold ?? 0;
  const actionCfg =
    (agentCfg.actions || {})[action] || (def.actions || {}).default || {};
  const features = actionCfg.features || {};
  const featureNames = new Set([
    ...Object.keys(weights),
    ...Object.keys(features),
  ]);
  let score = 0;
  for (const name of featureNames) {
    score += (weights[name] || 0) * (features[name] || 0);
  }
  const probability = sigmoid((score - threshold) / beta);
  const allowed = probability >= 0.5;
  if (!allowed) {
    console.warn(
      `Permission denied agent=${agent} action=${action} prob=${probability}`,
    );
  }
  return allowed;
}
