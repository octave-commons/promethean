import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface ToolSeed {
  readonly id: string;
  readonly description: string;
  readonly enabled: boolean;
}

export interface McpServerSeed {
  readonly id: string;
  readonly script: string;
  readonly cwd?: string;
  readonly args: readonly string[];
  readonly port?: number;
  readonly sourceFile: string;
  readonly running: false;
}

interface ToolDefinition {
  readonly id: string;
  readonly description: string;
}

const OPENCODE_TOOLS: readonly ToolDefinition[] = [
  { id: "question", description: "Ask targeted user clarifications." },
  { id: "bash", description: "Run shell commands." },
  { id: "read", description: "Read files and directories." },
  { id: "glob", description: "Find files by pattern." },
  { id: "grep", description: "Search file contents." },
  { id: "edit", description: "Apply focused line edits." },
  { id: "write", description: "Write complete file contents." },
  { id: "task", description: "Delegate complex subtasks." },
  { id: "webfetch", description: "Fetch web content from URL." },
  { id: "todowrite", description: "Track task list state." },
  { id: "websearch", description: "Search the web for research." },
  { id: "codesearch", description: "Search code examples." },
  { id: "skill", description: "Load reusable skill packs." },
  { id: "apply_patch", description: "Apply file-oriented diff patches." },
];

export function getToolSeedForModel(modelId: string): ToolSeed[] {
  const lower = modelId.toLowerCase();
  const usePatch = lower.includes("gpt-") && !lower.includes("oss") && !lower.includes("gpt-4");

  return OPENCODE_TOOLS.map((tool) => {
    if (tool.id === "apply_patch") {
      return {
        id: tool.id,
        description: tool.description,
        enabled: usePatch,
      };
    }

    if (tool.id === "edit" || tool.id === "write") {
      return {
        id: tool.id,
        description: tool.description,
        enabled: !usePatch,
      };
    }

    return {
      id: tool.id,
      description: tool.description,
      enabled: true,
    };
  });
}

function parseVector(raw: string): string[] {
  const values: string[] = [];
  const regex = /"([^"]+)"/g;
  for (const match of raw.matchAll(regex)) {
    values.push(match[1]);
  }
  return values;
}

function parseDefappBlocks(content: string): Array<{ readonly name: string; readonly body: string }> {
  const blocks: Array<{ name: string; body: string }> = [];
  const markerSpaced = "(clobber.macro/defapp \"";

  let index = 0;
  while (index < content.length) {
    const markerIndex = content.indexOf(markerSpaced, index);
    if (markerIndex < 0) {
      break;
    }

    const nameStart = markerIndex + markerSpaced.length;
    const nameEnd = content.indexOf('"', nameStart);
    if (nameEnd < 0) {
      break;
    }

    const name = content.slice(nameStart, nameEnd);
    let depth = 0;
    let end = markerIndex;
    for (; end < content.length; end += 1) {
      const char = content[end];
      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }

    const body = content.slice(markerIndex, end);
    blocks.push({ name, body });
    index = end;
  }

  return blocks;
}

function parsePort(body: string): number | undefined {
  const match = body.match(/:PORT\s+"(\d+)"/);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isLikelyMcpServer(name: string, script: string, cwd: string | undefined, body: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerScript = script.toLowerCase();
  const lowerCwd = (cwd ?? "").toLowerCase();
  const lowerBody = body.toLowerCase();

  const nameOrPathSignal =
    lowerName.startsWith("mcp-") ||
    lowerName.includes("-mcp") ||
    lowerScript.includes("mcp") ||
    lowerCwd.includes("/mcp-") ||
    lowerCwd.endsWith("/mcp");

  if (nameOrPathSignal) {
    return true;
  }

  const protocolSignal = body.includes(":MCP_TRANSPORT") || body.includes(":LEGACY_MCP_URL");
  if (protocolSignal) {
    return true;
  }

  if (body.includes(":MCP_SERVICE_URLS")) {
    return false;
  }

  const sharedSecretSignal = body.includes(":MCP_INTERNAL_SHARED_SECRET") && body.includes(":PORT");
  const mcpConfigSignal = lowerBody.includes("mcp-files.json");

  return sharedSecretSignal || mcpConfigSignal;
}

function parseMcpSeed(name: string, body: string, sourceFile: string): McpServerSeed | null {
  const script = body.match(/:script\s+"([^"]+)"/)?.[1] ?? "";
  const cwd = body.match(/:cwd\s+"([^"]+)"/)?.[1];
  const argsRaw = body.match(/:args\s+\[([^\]]*)\]/)?.[1] ?? "";
  const args = parseVector(argsRaw);

  const indicatesMcp = isLikelyMcpServer(name, script, cwd, body);

  if (!indicatesMcp) {
    return null;
  }

  return {
    id: name,
    script,
    cwd,
    args,
    port: parsePort(body),
    sourceFile,
    running: false,
  };
}

export async function loadMcpSeeds(ecosystemsDir: string): Promise<McpServerSeed[]> {
  const entries = await readdir(ecosystemsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".cljs"))
    .map((entry) => entry.name);

  const seeds: McpServerSeed[] = [];

  for (const fileName of files) {
    const absolute = join(ecosystemsDir, fileName);
    const content = await readFile(absolute, "utf8");
    const blocks = parseDefappBlocks(content);

    for (const block of blocks) {
      const seed = parseMcpSeed(block.name, block.body, absolute);
      if (!seed) {
        continue;
      }

      seeds.push(seed);
    }
  }

  const deduped = new Map<string, McpServerSeed>();
  for (const seed of seeds) {
    deduped.set(seed.id, seed);
  }

  return [...deduped.values()].sort((a, b) => a.id.localeCompare(b.id));
}
