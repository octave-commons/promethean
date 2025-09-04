import { createLogger, type Logger } from "@promethean/utils/logger.js";

export function makeLogger(service = "cephalon"): Logger {
  return createLogger({ service });
}

export type { Logger };
