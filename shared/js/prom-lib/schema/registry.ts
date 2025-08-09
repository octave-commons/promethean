import { z, ZodTypeAny } from "zod";

export type Compat = "none" | "backward" | "forward";
export type TopicId = string;

export interface TopicSchema {
  topic: TopicId;
  version: number;
  schema: ZodTypeAny;
  compat: Compat;
}

export class SchemaRegistry {
  private versions = new Map<TopicId, TopicSchema[]>();

  register(def: TopicSchema) {
    const list = this.versions.get(def.topic) ?? [];
    if (list.length && def.version <= list[list.length - 1].version) {
      throw new Error(`version must increase for ${def.topic}`);
    }
    if (list.length && def.compat !== "none") {
      const prev = list[list.length - 1];
      checkCompat(prev.schema, def.schema, def.compat);
    }
    list.push(def);
    this.versions.set(def.topic, list);
  }

  latest(topic: TopicId): TopicSchema | undefined {
    const list = this.versions.get(topic);
    if (!list || !list.length) return;
    return list[list.length - 1];
  }

  validate(topic: TopicId, payload: unknown, version?: number) {
    const list = this.versions.get(topic);
    if (!list || !list.length) return;
    const schema = version
      ? list.find((s) => s.version === version)?.schema
      : list[list.length - 1].schema;
    schema?.parse(payload);
  }
}

function checkCompat(prev: ZodTypeAny, next: ZodTypeAny, compat: Compat) {
  if (compat === "backward") {
    const res = (next as any)
      .partial()
      .safeParse((prev as any).partial().parse({}));
    if (!res.success) throw new Error("backward compatibility check failed");
  }
  if (compat === "forward") {
    const res = (prev as any)
      .partial()
      .safeParse((next as any).partial().parse({}));
    if (!res.success) throw new Error("forward compatibility check failed");
  }
}
