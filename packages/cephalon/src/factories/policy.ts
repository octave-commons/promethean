// SPDX-License-Identifier: GPL-3.0-only
import { checkPermission } from "@promethean/legacy/permissionGate.js";

export class NotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotAllowedError";
  }
}

export type PolicyChecker = {
  assertAllowed: (
    subject: string,
    action: string,
    resource?: string,
  ) => Promise<void>;
};

export function makePolicy(): PolicyChecker {
  return {
    async assertAllowed(subject: string, action: string, _resource?: string) {
      // permissionGate currently expects two args (subject, action)
      const ok = checkPermission(subject, action);
      if (!ok) throw new NotAllowedError("Permission denied");
    },
  };
}
