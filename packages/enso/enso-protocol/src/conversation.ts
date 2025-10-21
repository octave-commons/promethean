/**
 * Conversation orchestration utilities for the ENSO CLI.
 */
import { createInterface } from "node:readline/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Interface } from "node:readline/promises";

export interface AgentMeta {
  name: string;
  command: string;
  args: string[];
}

export interface ConversationCliOptions {
  agentNames?: string[];
  log?: (message: string) => void;
  error?: (message: string) => void;
  readlineFactory?: () => Interface;
  metaOverride?: AgentMeta[];
  useOllama?: boolean;
  configPath?: string;
}

/**
 * Parse conversation CLI arguments, returning selected agent identifiers and
 * whether Ollama-backed responses should be used.
 */
export function parseConversationArgs(args: string[] = []): {
  agentNames?: string[];
  useOllama: boolean;
  configPath?: string;
} {
  let agentNames: string[] | undefined;
  let useOllama = false;
  let configPath: string | undefined;
  let pendingEdn = false;

  for (const token of args) {
    if (pendingEdn) {
      if (!token.startsWith("-")) {
        configPath = token;
        pendingEdn = false;
        continue;
      }
      pendingEdn = false;
    }

    if (token === "--ollama" || token === "-o") {
      useOllama = true;
      continue;
    }
    if (token === "--edn" || token === "-e") {
      pendingEdn = true;
      continue;
    }
    if (token.startsWith("--edn=")) {
      const value = token.slice("--edn=".length);
      if (value) {
        configPath = value;
      }
      continue;
    }
    if (!agentNames) {
      agentNames = token
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    }
  }

  const result: {
    agentNames?: string[];
    useOllama: boolean;
    configPath?: string;
  } = { useOllama };
  if (agentNames && agentNames.length) {
    result.agentNames = agentNames;
  }
  if (configPath) {
    result.configPath = configPath;
  }
  return result;
}

/**
 * Parse a minimal subset of the MCP EDN configuration to recover available
 * server commands. The parser is intentionally lightweight and only recognises
 * top-level `:mcp-servers` entries with `:command` and optional `:args`.
 */
export function parseMcpServers(edn: string): AgentMeta[] {
  const lines = edn.split(/\r?\n/);
  const metas: AgentMeta[] = [];
  let currentName: string | undefined;
  let currentCommand: string | undefined;
  let currentArgs: string[] = [];
  let inside = false;

  const flush = () => {
    if (inside && currentName && currentCommand) {
      metas.push({
        name: currentName,
        command: currentCommand,
        args: currentArgs,
      });
    }
    inside = false;
    currentName = undefined;
    currentCommand = undefined;
    currentArgs = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    const startMatch = line.match(/^\{\s*:([A-Za-z0-9_-]+)/);
    const inlineMatch = line.match(/^:([A-Za-z0-9_-]+)\s+\{/);
    if (startMatch && startMatch[1] !== "mcp-servers") {
      flush();
      inside = true;
      currentName = startMatch[1];
    } else if (inlineMatch && inlineMatch[1] !== "mcp-servers") {
      flush();
      inside = true;
      currentName = inlineMatch[1];
    }
    if (!inside) {
      continue;
    }
    if (line.includes(":command")) {
      const match = line.match(/:command\s+"([^"]+)"/);
      if (match) {
        currentCommand = match[1];
      }
    }
    if (line.includes(":args")) {
      const argsMatch = line.match(/\[([^\]]*)\]/);
      if (argsMatch) {
        const rawArgs = argsMatch[1] ?? "";
        currentArgs = rawArgs
          .split(/\s+/)
          .filter(Boolean)
          .map((value) => value.replace(/^"|"$/g, ""));
      }
    }
    if (line.endsWith("}") || line.endsWith("}}")) {
      flush();
    }
  }
  flush();
  return metas;
}

/**
 * Lightweight agent that produces canned responses based on its MCP command or
 * forwards prompts to an Ollama model when configured.
 */
class AgentSession {
  constructor(
    private readonly meta: AgentMeta,
    private readonly useOllama: boolean,
  ) {}

  /** Generate a synthetic response for demo purposes. */
  async respond(input: string): Promise<string> {
    if (this.useOllama) {
      return this.runOllama(input);
    }
    if (this.meta.command.includes("duck")) {
      return `[${this.meta.name}] (search) Top hit for "${input}" would be summarised here.`;
    }
    if (this.meta.command.includes("github")) {
      return `[${this.meta.name}] (repo) I'd check open issues related to "${input}".`;
    }
    if (this.meta.command.includes("filesystem")) {
      return `[${this.meta.name}] (fs) I'd inspect files matching "${input}".`;
    }
    return `[${this.meta.name}] Acknowledged message: ${input}`;
  }

  private async runOllama(prompt: string): Promise<string> {
    const { spawn } = await import("node:child_process");
    const model = this.meta.name.includes("github") ? "llama3" : "llama3:8b";
    return new Promise<string>((resolve) => {
      const child = spawn("ollama", ["run", model, prompt]);
      const chunks: string[] = [];
      child.stdout.on("data", (data) => chunks.push(data.toString()));
      child.on("error", () =>
        resolve(`[${this.meta.name}] (ollama) Unable to reach model.`),
      );
      child.on("close", (code) => {
        if (code !== 0) {
          resolve(
            `[${this.meta.name}] (ollama) Model exited with code ${code}.`,
          );
        } else {
          resolve(`[${this.meta.name}] ${chunks.join("").trim()}`);
        }
      });
    });
  }
}

/** Resolve the absolute path to the MCP EDN configuration file. */
export function resolveConfigPath(ednPath?: string): string {
  if (ednPath && ednPath.trim()) {
    return resolve(ednPath);
  }
  const here = fileURLToPath(new URL(".", import.meta.url));
  return resolve(here, "../mcp/examples/mcp_servers.edn");
}

/** Load MCP server metadata from the specified or default EDN configuration. */
export function loadServerMetadata(ednPath?: string): AgentMeta[] {
  const target = resolveConfigPath(ednPath);
  const contents = readFileSync(target, "utf8");
  return parseMcpServers(contents);
}

/**
 * Start a conversation with two agents sourced from the MCP configuration. The
 * CLI loops until the user types `exit` or `quit`.
 */
export async function runTwoAgentConversation(
  options: ConversationCliOptions = {},
): Promise<void> {
  const log = options.log ?? console.log;
  const error = options.error ?? console.error;

  let servers: AgentMeta[];
  if (options.metaOverride) {
    servers = options.metaOverride;
  } else {
    try {
      servers = loadServerMetadata(options.configPath);
    } catch (cause) {
      error(
        `Failed to load MCP servers from ${resolveConfigPath(
          options.configPath,
        )}: ${(cause as Error).message}`,
      );
      return;
    }
  }

  if (servers.length < 2) {
    error(
      "Not enough MCP servers configured to start a dual-agent conversation.",
    );
    return;
  }

  const [first, second] = selectAgents(servers, options.agentNames);
  const useOllama = options.useOllama ?? false;
  const agents = [
    new AgentSession(first, useOllama),
    new AgentSession(second, useOllama),
  ];

  const rl = options.readlineFactory
    ? options.readlineFactory()
    : createInterface({ input: process.stdin, output: process.stdout });
  log(
    `Starting ENSO dual-agent chat with ${first.name} and ${second.name}. Type 'exit' to quit.`,
  );

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const answer = await rl.question("You: ");
      const message = answer ?? "";
      if (
        !message ||
        message.toLowerCase() === "exit" ||
        message.toLowerCase() === "quit"
      ) {
        log("Ending conversation.");
        break;
      }
      for (const agent of agents) {
        const response = await agent.respond(message);
        log(response);
      }
    }
  } finally {
    await rl.close();
  }
}

function selectAgents(
  servers: AgentMeta[],
  requested: string[] | undefined,
): [AgentMeta, AgentMeta] {
  if (servers.length < 2) {
    throw new Error("selectAgents requires at least two servers");
  }
  if (requested && requested.length === 2) {
    const [nameA, nameB] = requested;
    const first = servers.find((server) => server.name === nameA);
    const second = servers.find(
      (server) => server.name === nameB && server !== first,
    );
    if (first && second) {
      return [first, second];
    }
  }
  return [servers[0]!, servers[1]!];
}
