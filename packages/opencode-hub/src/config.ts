import os from "node:os";
import path from "node:path";
import process from "node:process";
import { HubConfig } from "./types.js";

const expandHome = (p: string) => p.replace(/^~(?=$|\/|\\)/, os.homedir());

export function loadConfig(): HubConfig {
  const rootDir = expandHome(process.env.ROOT_DIR ?? "~/devel");
  const hubPort = Number(process.env.HUB_PORT ?? 4799);
  const opencodeBin = process.env.OPENCODE_BIN ?? "opencode";
  const opencodeArgs = (process.env.OPENCODE_ARGS ?? "serve --port").split(" ");
  const opencodeBasePort = Number(process.env.OPENCODE_BASE_PORT ?? 5900);
  return { rootDir: path.resolve(rootDir), hubPort, opencodeBin, opencodeArgs, opencodeBasePort };
}