import { EventRow } from "../types";

export class MemoryStorage {
  private rows = new Map<string, EventRow[]>();
  private commits = new Map<string, number>();
  private counters = new Map<string, number>();

  key(topic: string, p: number) {
    return `${topic}:${p}`;
  }

  async nextOffset(topic: string, p: number) {
    const k = this.key(topic, p);
    const n = (this.counters.get(k) ?? 0) + 1;
    this.counters.set(k, n);
    return n;
  }

  async insertEvent(row: EventRow) {
    const k = this.key(row.topic, row.partition!);
    const arr = this.rows.get(k) ?? [];
    arr.push(row);
    this.rows.set(k, arr);
  }

  async readFrom(topic: string, p: number, offset: number, limit: number) {
    const arr = this.rows.get(this.key(topic, p)) ?? [];
    return arr.filter((r) => r.offset >= offset).slice(0, limit);
  }

  async committed(topic: string, p: number, g: string) {
    return this.commits.get(`${topic}:${p}:${g}`) ?? 0;
  }
  async commit(topic: string, p: number, g: string, off: number) {
    this.commits.set(
      `${topic}:${p}:${g}`,
      Math.max(off, await this.committed(topic, p, g)),
    );
  }
}
