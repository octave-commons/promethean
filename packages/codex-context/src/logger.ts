import { createLogger as baseCreateLogger, type LogFields } from "@promethean/utils/logger.js";
export type { Logger, LogFields } from "@promethean/utils/logger.js";

export function createLogger(service: string, base: LogFields = {}) {
  return baseCreateLogger({ service, base });
}
