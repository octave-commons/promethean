import { createLogger } from "@promethean/utils";

import { logStream } from "./log-stream.js";
import {
  createLevelCacheStateStore,
  setIndexerLogger,
  setIndexerStateStore,
} from "@promethean/indexer-core";

setIndexerLogger(
  createLogger({ service: "smartgpt-bridge", stream: logStream }),
);
setIndexerStateStore(createLevelCacheStateStore(".cache/smartgpt-bridge"));

export * from "@promethean/indexer-core";
