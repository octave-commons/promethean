import type {
  Context,
  ContextEntry,
  DataSourceMeta,
  LlmView,
  Availability,
} from "@promethean/enso-protocol/context.js";

export class ContextRegistry {
  private contexts = new Map<string, Context>();
  private sources = new Map<string, DataSourceMeta>(); // key = kind + "|" + location

  upsertSource(meta: DataSourceMeta) {
    this.sources.set(`${meta.id.kind}|${meta.id.location}`, meta);
  }
  getSource(id: { kind: string; location: string }) {
    return this.sources.get(`${id.kind}|${id.location}`);
  }

  create(ctx: Context) {
    this.contexts.set(ctx.ctxId, ctx);
  }
  updateEntry(ctxId: string, entry: ContextEntry) {
    /* merge state */
  }

  llmView(ctxId: string): LlmView {
    const ctx = this.contexts.get(ctxId)!;
    const active: DataSourceMeta[] = [];
    const standby: DataSourceMeta[] = [];
    const ignored: DataSourceMeta[] = [];
    for (const e of ctx.entries) {
      const meta = this.getSource(e.id);
      if (!meta) continue;
      switch (e.state) {
        case "active":
        case "pinned":
          active.push(meta);
          break;
        case "standby":
          standby.push(meta);
          break;
        case "ignored":
          ignored.push(meta);
          break;
      }
    }
    // parts: prefer derived text/image if present (lookup in cache registry)
    const parts: LlmView["parts"] = active.map((m) => ({
      id: m.id,
      purpose: "text",
      uri: `enso://asset/${/* lookup */ "cid…"}`,
      mime: "text/markdown",
    }));
    return { ctxId, active, standby, ignored, grants: [], parts };
  }
}
