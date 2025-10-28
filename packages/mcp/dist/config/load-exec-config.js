import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
const ExecCommand = z
    .object({
    id: z.string(),
    command: z.string(),
    args: z.array(z.string()).default([]).readonly(),
    description: z.string().optional(),
    cwd: z.string().optional(),
    env: z.record(z.string()).optional(),
    allowExtraArgs: z.boolean().default(false),
    timeoutMs: z.number().int().positive().optional(),
})
    .readonly();
const ExecConfig = z
    .object({
    commands: z.array(ExecCommand).default([]).readonly(),
    defaultCwd: z.string().optional(),
    defaultTimeoutMs: z.number().int().positive().optional(),
    forceKillDelayMs: z.number().int().positive().optional(),
})
    .readonly();
const readJsonFileSync = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const findUpSync = (start, fileName) => {
    const search = (current, depth) => {
        if (depth > 100) {
            return null;
        }
        const resolved = path.resolve(current);
        const candidate = path.join(resolved, fileName);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
        }
        const parent = path.dirname(resolved);
        if (parent === resolved) {
            return null;
        }
        return search(parent, depth + 1);
    };
    return search(start, 0);
};
const parseConfig = (input, source) => {
    const parsed = ExecConfig.safeParse(input);
    if (parsed.success) {
        return parsed.data;
    }
    throw new Error(`Invalid MCP exec config at ${source}: ${parsed.error.message}`);
};
const parseInlineConfig = (inline) => parseConfig(JSON.parse(inline), "MCP_EXEC_COMMANDS_JSON");
export const loadApprovedExecConfig = (env, cwd = process.cwd()) => {
    const explicit = env.MCP_EXEC_CONFIG;
    if (typeof explicit === "string" && explicit.trim().length > 0) {
        const abs = path.resolve(cwd, explicit);
        if (!fs.existsSync(abs)) {
            throw new Error(`MCP_EXEC_CONFIG points to missing file: ${abs}`);
        }
        return parseConfig(readJsonFileSync(abs), abs);
    }
    const inline = env.MCP_EXEC_COMMANDS_JSON;
    if (typeof inline === "string" && inline.trim().length > 0) {
        return parseInlineConfig(inline);
    }
    const auto = findUpSync(cwd, "promethean.mcp.exec.json");
    if (auto) {
        return parseConfig(readJsonFileSync(auto), auto);
    }
    return ExecConfig.parse({});
};
//# sourceMappingURL=load-exec-config.js.map