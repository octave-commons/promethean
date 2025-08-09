import { Policy, Rule } from "./policy";

export function scopesToPolicy(scopes: string[]): Policy {
  // scope format: "<action>:<pattern>" e.g., "publish:heartbeat.*"
  const rules: Rule[] = scopes.map((s) => {
    const [action, pattern] = s.split(":");
    return {
      effect: "allow",
      action: action === "*" ? "*" : (action as any),
      topics: [pattern ?? "**"],
    };
  });
  // Default deny if nothing matches; explicit deny could be added later
  return { rules };
}
