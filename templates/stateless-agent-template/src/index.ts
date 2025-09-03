// SPDX-License-Identifier: GPL-3.0-only
import { start } from "./agent.js";

// Your real runtime wiring should create an AgentRuntime instance and call start(rt).
start(undefined as any).catch((err) => {
  console.error("agent failed to start", err);
  process.exit(1);
});
