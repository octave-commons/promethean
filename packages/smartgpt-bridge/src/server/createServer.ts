import { buildFastifyApp } from "../fastifyApp.js";

export type ServerDeps = Parameters<typeof buildFastifyApp>[1];

export async function createServer(rootPath: string, deps: ServerDeps = {}) {
  return buildFastifyApp(rootPath, deps);
}
