// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { Policy } from "../models/Policy.js";

export async function checkAccess(user, action, resource) {
  if (!user) return false;
  const policies = await Policy.find({ role: { $in: user.roles } });

  for (const p of policies) {
    if (
      (p.action === action || p.action === "*") &&
      (p.resource === resource || p.resource === "*") &&
      p.effect === "deny"
    ) {
      return false;
    }
  }

  for (const p of policies) {
    if (
      (p.action === action || p.action === "*") &&
      (p.resource === resource || p.resource === "*") &&
      p.effect === "allow"
    ) {
      return true;
    }
  }

  return false;
}
