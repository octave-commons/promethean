export type Action = "publish" | "subscribe";
export interface Rule {
  effect: "allow" | "deny";
  action: Action | "*";
  topics: string[]; // wildcard patterns
  groups?: string[]; // for subscribe ACL (optional)
}
export interface Policy {
  rules: Rule[];
}

export function isAllowed(
  policy: Policy,
  action: Action,
  topic: string,
  group?: string,
): boolean {
  // first-match-wins; deny beats allow if tied
  for (const r of policy.rules) {
    if (r.action !== "*" && r.action !== action) continue;
    const topicMatch = r.topics.some((p) => matchTopic(p, topic));
    if (!topicMatch) continue;
    if (action === "subscribe" && r.groups?.length) {
      if (!group) return false;
      const groupOk = r.groups.includes(group) || r.groups.includes("*");
      if (!groupOk) continue;
    }
    return r.effect === "allow";
  }
  // default deny
  return false;
}

import { matchTopic } from "./match";
