import type { EventRecord, UUID } from './types.js';

export class Outbox {
  private pending = new Map<UUID, EventRecord>();

  add(event: EventRecord): void {
    this.pending.set(event.id, event);
  }

  remove(eventId: UUID): EventRecord | undefined {
    const event = this.pending.get(eventId);
    this.pending.delete(eventId);
    return event;
  }

  get(eventId: UUID): EventRecord | undefined {
    return this.pending.get(eventId);
  }

  getAll(): EventRecord[] {
    return Array.from(this.pending.values());
  }

  size(): number {
    return this.pending.size;
  }

  clear(): void {
    this.pending.clear();
  }
}
