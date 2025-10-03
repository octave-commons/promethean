import type { ToolFactory, ToolSpec } from "../core/types.js";

// Lints the currently loaded MCP configuration using context injected by index.ts
export const validateConfig: ToolFactory = (ctx) => {
  const spec = {
    name: "mcp.validate-config",
    description:
      "Validate endpoint/tool configuration and narrative metadata. Returns errors and warnings.",
    inputSchema: {},
    outputSchema: { ok: true, errors: [], warnings: [], summary: {} } as any,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;

  const invoke = async () => {
    const endpoints: any[] = (ctx as any).__allEndpoints ?? [];
    const allToolIds: string[] = (ctx as any).__allToolIds ?? [];

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const ep of endpoints) {
      const prefix = `endpoint:\`${ep.path}\``;
      const tools: string[] = ep.tools ?? [];
      // unknown tools
      for (const t of tools) {
        if (!allToolIds.includes(t)) {
          errors.push(`${prefix} unknown tool id: ${t}`);
        }
      }
      // meta checks
      const meta = ep.meta ?? {};
      if (!meta.title) warnings.push(`${prefix} meta.title is missing`);
      if (!meta.description)
        warnings.push(`${prefix} meta.description is missing`);
      // workflow hints should mention at least one tool id
      const wf: string[] = Array.isArray(meta.workflow) ? meta.workflow : [];
      for (const [i, step] of wf.entries()) {
        const mentions = allToolIds.some((id) => step.includes(id));
        if (!mentions) {
          warnings.push(
            `${prefix} meta.workflow[${i}] doesn't reference any tool id`,
          );
        }
      }
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      summary: {
        endpoints: endpoints.length,
        unknownTools: errors.length,
        warnings: warnings.length,
      },
    };
  };

  return { spec, invoke };
};

export default validateConfig;
