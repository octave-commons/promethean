import type { CompatEvent, EventEnvelope } from "./types.js";

type Listener = (event: EventEnvelope) => void;

export class CompatEventBus {
  readonly #listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  publish(directory: string, payload: CompatEvent) {
    const envelope = { directory, payload };
    for (const listener of this.#listeners) {
      listener(envelope);
    }
  }
}
